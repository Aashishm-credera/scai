# Design Tokens

Turns the #236853 Figma export into the CSS variables and typed runtime values used by the
Next.js application and Storybook. The JSON export is the only token-value source of truth.

```
figma-export.json → validate → generate shared CSS + TypeScript → Next.js / Storybook
```

## Quick start

```bash
npm run tokens:validate  # validate syntax, schema, names, values, units, and references only
npm run tokens:build     # validate first, then generate every shared output
npm run tokens:test      # unit tests for validation and runtime generation
npm run tokens:check     # tests + validation + generation; CI uses this
npm run tokens:baseline  # "lock in" this update. Pins the baseline AND writes CHANGELOG.md, automatically
```

That's the whole interface. Run `tokens:build` any time `figma-export.json` changes, commit
the result, done. Token outputs are never hand-edited, not the CSS, reports, generated token
data, or changelog.

Icons use a separate pipeline by design: `design-tokens/icons/inventory.json` is the committed
input, `npm run icons:build` generates the app-facing icon registry, and `npm run icons:check`
performs the read-only CI drift check. See [`docs/ICONS.md`](../docs/ICONS.md). The `tokens:*` and
`icons:*` workflows are intentionally not merged.

## Updating the export

`figma-export.json` is a **Tokens Studio for Figma** single-file export. It is not Figma's own
"Export" button in the variables panel, which produces a different shape that this pipeline
rejects. Three things identify the format, all visible in the current file:

- top-level `$metadata.tokenSetOrder` and `$themes`, which is Tokens Studio's envelope;
- token sets keyed `Collection/Mode` (`_Primitive/Value`, `Color/Light`, `Breakpoint/sm`…);
- `$type` values using Tokens Studio's **plural** names: `fontSizes`, `lineHeights`,
  `fontWeights`, `letterSpacing`. The W3C spec and Figma's native export both use the singular.

Each Figma **mode** becomes its own set, which is why `Breakpoint` appears four times with
identical structure and different values.

To update: export from Tokens Studio as a single JSON file with every set included, overwrite
`figma-export.json`, then:

```bash
npm run tokens:check     # validates, then regenerates every shared output
```

Read `reports/issues.md` (problems in the export) and `reports/changes.md` (what moved vs. the
baseline) before committing. The generated CSS and both reports must be committed alongside the
export or CI's drift check fails.

`validate.mjs` enforces the contract: `$metadata.tokenSetOrder` must be a non-empty array with no
duplicates, every name in it must resolve to an object in the file, and all seven sets listed in
`REQUIRED_TOKEN_SETS` must be present. Extra sets beyond those seven are processed, not rejected.

The `codeSyntax.Web` value on each token is load-bearing. It is where the `--abc-*` variable names
come from, and the collision allowlist in `token.config.mjs` is keyed on it. An export that drops
`codeSyntax` will rename large parts of the stylesheet.

There is no Figma API integration in this repo, so this is a manual step today.

## Folder structure

```
design-tokens/
├── figma-export.json      the designer's export, the only file they touch
├── icons/
│   ├── inventory.json       committed icon input extracted from the approved Figma sections
│   └── icon-asset-exceptions.json  documented quarantined exports
├── scripts/
│   ├── generate.mjs       token build/check pipeline
│   └── icons.mjs          separate icon build/check pipeline
├── generated/              COMMITTED. Durable data the pipeline keeps
│   ├── tokens.json           every token, flattened + resolved (see below)
│   ├── tokens.ts             typed runtime values for Next.js and Storybook
│   └── baseline.json         a pinned copy of tokens.json, from the last `tokens:baseline`
├── reports/                 COMMITTED. The latest run's human-readable summary
│   ├── issues.md / .json     problems found in the export (broken refs, naming clashes…)
│   └── changes.md / .json    what changed vs. the baseline (added / removed / modified)
└── CHANGELOG.md             AUTO-WRITTEN by `tokens:baseline`: no one edits this by hand

src/design-system/tokens/generated/          COMMITTED, the actual CSS Storybook imports
├── primitives.css            raw values
├── semantic.css               roles + responsive breakpoints
└── theme.css                  Tailwind @theme + base UI variable mapping

src/design-system/design/design-tokens/   the Storybook "Design" pages
├── DesignTokens.mdx              the only hand-written page, pipeline prose, no values
├── {Color,Typography,Spacing,Radius,Elevation,Breakpoint}Tokens.tsx
│                                 one page per category, each reading @design-tokens
├── TokenLayout.tsx               shared page/section chrome
└── token-tree.ts                 traversal shared by the pages (unit-tested)
```

Nothing under `src/design-system/tokens/generated/` is hand-authored. The generator writes those three files
by exact filename on every run. Documentation lives with the components that render it.

**The rule of thumb:** `generated/` is data the _pipeline_ needs to remember between runs
(tokens.json for diffing, baseline.json for `--pinned`). `reports/` is the human-readable
narrative of the most recent run. Committed too, so `git log -p -- design-tokens/reports/`
is a free, permanent history of every sync's diff and issues, without regenerating anything.
Both are overwritten on every `tokens:build`; nothing in either is hand-edited.
The site and Storybook consume these exact files through `src/app/globals.css`; runtime values can be
imported through `@design-tokens`.

Neither `tokens.json` nor the `reports/` files carry a generation timestamp. That would make
every rebuild show a diff even when nothing changed. Git already records exactly when each
version landed (the commit date); no need to duplicate that inside the file.

## How it works, step by step

Running `npm run tokens:build` does all of this in order:

1. **Validate before writing anything.** Validation covers JSON syntax; required token sets,
   `$value`, and `$type`; supported types; names and generated-name collisions; colors;
   numbers; units; reference syntax and missing references; and consistent breakpoint-set
   shapes. Every error includes the set/token path, bad value, expected format, and reason.
2. **Read** `figma-export.json` and walk every token set it declares.
3. **Resolve** every `{reference}` to its final value (colors, spacing, sizes, all of it),
   following chains of references as needed. This fully-resolved value is what goes into
   `generated/tokens.json` (needed for diffing, see below). The **CSS**, separately, keeps
   the reference as a real `var()` link instead of a copy of the value, e.g. a semantic
   color token that points at a primitive in Figma renders as
   `--abc-text-default-primary: var(--abc-color-neutral-900);`, not the literal hex. That's
   what actually wires `semantic.css` to `primitives.css` (and `theme.css` to `semantic.css`)
   in the browser: change a primitive, and everything downstream inherits it, and you can
   follow the whole chain in devtools.
4. **Name** each token predictably. Existing Figma Web codeSyntax and generated fallback
   names are preserved for compatibility. The exact known collisions are allowlisted in
   `token.config.mjs`; any new collision fails validation.
5. **Build the responsive scale.** Figma exports 4 breakpoints (`sm/md/lg/xl`). The smallest
   is the base; anything that changes at a larger breakpoint becomes a CSS `@media` override
   of the same variable. One variable name everywhere, the media query does the resizing.
6. **Build typography.** Font size + line height (which vary per breakpoint) are combined
   with font family + weight (which don't) into one `--text-<role>-<size>` group per style,
   plus a ready-to-use class like `.text-heading-xl`.
7. **Build shadows.** Figma's shadow/focus-ring presets are stored as separate numbers
   (offset, blur, spread, color); this step combines each preset back into one CSS
   `box-shadow` value.
8. **Write shared outputs.** CSS goes to `src/design-system/tokens/generated/`; runtime values go to
   `design-tokens/generated/tokens.ts`. The module exports `tokens`, `breakpoints`,
   `breakpointTokens`, and `cssVariables` as readonly TypeScript values.
9. **Wire up Tailwind and the base UI components.** `theme.css` maps our tokens onto the
   short variable names the base UI components read (`--primary`, `--background` and so on)
   and onto Tailwind's `@theme`, including its responsive breakpoints, so
   `md:`/`lg:`/`xl:` prefixes fire at the client's breakpoints (480 / 1024 / 1600px) everywhere
   in the app.
10. **Keep `src/app/globals.css` wired to that CSS, automatically.** It contains a small,
    clearly-marked `@import` block (`BEGIN design-tokens imports` / `END …`) pointing at the
    three files above. This step scans the _whole file_ for every copy of those three import
    lines, inside the marker block, outside it, moved, duplicated, whatever, removes all of
    them, and reinserts exactly one, correctly positioned right after the stylesheet's other
    top-of-file imports (CSS requires `@import` to come before any other rule, so an import
    line dragged below, say, `@layer base` isn't just misplaced, it's invalid and gets
    silently ignored by the browser). Logged as a warning, not an error, since by the time
    you'd see it, it's already fixed. The point is to never rely on someone noticing the
    homepage silently lost every brand color.
11. **Compare** the result against a baseline (see "Baselines" below) and write
    `reports/changes.md`: what got added, removed, or changed value.
12. **Print a summary.** The npm scripts use strict generation; schema validation always
    fails immediately whether or not `--strict` was supplied directly to the generator.

## What we took from the two implementations we looked at first

Before building this, we looked at two existing token pipelines for ideas (neither is in
this repo, reviewed once, not kept around):

- **A small, dependency-free script**, we kept that idea: one plain Node file, no build
  framework, easy for any JS developer to read top to bottom.
- **A more built-out pipeline with a change-report and CI gate**, we kept that idea too:
  comparing against a baseline and failing CI on breaking changes.

## What we built or changed ourselves

Things neither of those did, that this pipeline does:

- **Preserves existing generated names.** The known #236853 codeSyntax collisions keep their
  established deterministic fallbacks; new, unreviewed collisions are rejected.
- **Full responsive support.** Every breakpoint is kept and turned into `@media` overrides,
  not dropped or flattened to a single value.
- **Typography built from the real responsive scale**, not the separate, partially broken
  legacy typography objects also present in the export (see "Known data issues" below).
- **Direct Tailwind v4 output.** `theme.css` is generated to satisfy both the base UI
  components' variable names and Tailwind's `@theme`, including realigning Tailwind's own
  `md:`/`lg:`/`xl:` breakpoints to the client's (480 / 1024 / 1600px) and resetting Tailwind's
  stock `sm:` / `2xl:`, which are not in the spec. Those thresholds are not in the Figma
  export; they live in the `BREAKPOINTS` constant in `generate.mjs`.
- **REM, not PX**, for anything meant to scale with the user's font-size setting (font
  sizes, spacing, radius, layout widths). Matching how Tailwind's own default scale works.
  Shadow offsets/blur stay in px, which is also how Tailwind's own shadow tokens work.
- **Reusable validation.** The CLI and generator call the same module, and Node tests cover
  invalid JSON, color/unit formats, missing references, name collisions, and breakpoint drift.

## The generated files, explained

| File                                       | What it is                                                                                            | Why                                                                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generated/tokens.json`                    | Every token, flattened out of Figma's nested `{reference}` tree and fully resolved to its final value | You can't meaningfully diff the raw export. A value could change, or something it points at could change. This flat list is what makes "did anything change" answerable at all. |
| `generated/tokens.ts`                      | Readonly nested runtime values, breakpoint values/sets, and matching CSS variable references          | JavaScript behavior can use the same values as CSS without duplicating constants.                                                                                               |
| `generated/baseline.json`                  | A pinned copy of `tokens.json`, written by `npm run tokens:baseline`                                  | `tokens.json` is a snapshot of _now_. The report needs something to compare it _against_. This is that fixed point.                                                             |
| `reports/changes.md` / `.json`             | Added / removed / modified since the baseline                                                         | The PR-review signal. Removed = breaking = something in `src/` likely needs updating.                                                                                           |
| `reports/issues.md` / `.json`              | Problems the export itself has (broken references, naming collisions, …)                              | A health check on the Figma file, not on your code.                                                                                                                             |
| `src/design-system/tokens/generated/*.css` | The final CSS                                                                                         | This is what `src/app/globals.css` imports. Never hand-edit it. It is regenerated every run.                                                                                    |
| `CHANGELOG.md`                             | A permanent, dated history of every pin                                                               | Same diff `changes.md` shows, just kept forever instead of overwritten on the next run. Written automatically, see below.                                                       |

## Using a token in a component

Every semantic token is reachable two ways, and both are always valid.

**1. The utility class**. What you should normally reach for:

```tsx
<button className="min-h-abc-buttons-height-md bg-abc-surface-brand-brand-1 rounded-abc-radius-md">
```

**2. The raw variable**, identical to what Figma's "copy as CSS" produces, so a snippet
pasted straight out of Figma works with no translation:

```css
min-height: var(--abc-buttons-height-md);
```

The raw `--abc-*` name is the canonical one. The utility class exists because Tailwind only
builds classes from variables whose name _begins_ with one of its namespaces (`--color-*`,
`--spacing-*`, `--radius-*`, `--shadow-*`). A name starting with `--abc-` matches none of
them, so it generates no class, and editor autocomplete has nothing to suggest, because
there is no class to suggest. So the generator emits a second, namespaced alias pointing at
the same variable:

| Canonical (from Figma)        | Alias                               | Utilities you get                                            |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| `--abc-surface-brand-brand-1` | `--color-abc-surface-brand-brand-1` | `bg-abc-surface-brand-brand-1`, `text-abc-…`, `border-abc-…` |
| `--abc-spacing-inset-lg`      | `--spacing-abc-spacing-inset-lg`    | `p-abc-…`, `m-abc-…`, `gap-abc-…`, `w-abc-…`, `h-abc-…`      |
| `--abc-radius-md`             | `--radius-abc-radius-md`            | `rounded-abc-radius-md`                                      |
| `--abc-shadow-sm`             | `--shadow-abc-sm`                   | `shadow-abc-sm`                                              |

`abc` stays the first segment of every alias key, so no Tailwind default is ever shadowed.
`shadow-sm` is still Tailwind's, `shadow-abc-sm` is ours.

Two deliberate exceptions, both required rather than chosen:

- **The base UI variables** (`--primary`, `--background` and so on) keep their exact
  unprefixed names, because the components in `src/design-system/ui/` reference `var(--primary)`
  directly. Renaming them breaks those components.
- **`--breakpoint-md/lg/xl`** deliberately overwrite Tailwind's, because `md:` can only mean
  one width, and it should mean Figma's.

Primitives get no aliases on purpose. They are raw values; components use the semantic layer.

For runtime logic, import the generated module. The `@design-tokens` alias resolves to the
same file in Next.js and Storybook:

```ts
import { breakpointTokens, breakpoints, tokens } from '@design-tokens';

const tabletMinWidth = breakpoints.md; // "768px"
const mobileInlineSpace = tokens.spacing.inset.md;
const tabletInlineSpace = breakpointTokens.md.spacing.inset.md;
```

Do not copy values into app or story files. Add/change the JSON token and regenerate.

## Baselines: what am I being compared against?

- **The npm commands** (`tokens:build`, `tokens:check`, and `tokens:breaking`) compare against
  `generated/baseline.json`. This is deterministic locally and in a clean CI checkout.
- **A direct generator run without `--pinned`** compares against the last committed
  `design-tokens/generated/tokens.json` at `HEAD`. This is available for maintainers who need
  to inspect only the current working-tree change.
- **`npm run tokens:baseline`** is how you _make_ that fixed point. It diffs the current
  build against the existing pinned baseline, and:
  - if anything changed, it **prepends a new entry to `CHANGELOG.md`**, date, counts,
    every added/removed/modified token, suggested semver bump, built entirely from that
    diff. Nobody writes this by hand; the file only says what the diff says.
  - if nothing changed, it writes nothing (no empty/duplicate entries) and tells you so.
  - either way, it then copies `tokens.json` → `baseline.json`, so this becomes the new
    fixed point for next time.

## Flags

| Flag                 | Effect                                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--strict`           | Exit with an error if generation finds an internal mapping/composition problem. Input schema validation is always strict and runs before writes.                                       |
| `--fail-on-breaking` | Exit with an error if any token was removed or renamed since the baseline.                                                                                                             |
| `--pinned`           | Compare against `generated/baseline.json` instead of git `HEAD`.                                                                                                                       |
| `--baseline=<path>`  | Compare against a specific file.                                                                                                                                                       |
| `--verbose`          | Also print warnings, not just errors.                                                                                                                                                  |
| `--pin`              | Lock this build in: diff against the current pinned baseline, auto-write the `CHANGELOG.md` entry, then update `generated/baseline.json`. This is what `npm run tokens:baseline` runs. |

`npm run tokens:breaking` adds the breaking-change gate. `tokens:check` is the normal CI-safe
test/validate/generate command; CI separately fails when those committed outputs are stale.

## Assumptions still needing design-system confirmation

- The export contains breakpoint mode names but not the CSS thresholds themselves, those
  aren't design data, they're the client's device-breakpoint mapping (S < 480, M >= 480,
  L >= 1024, XL >= 1600), confirmed with the design-system team on #236853.
  `token.config.mjs`'s `BREAKPOINTS` holds `sm=0`, `md=480`, `lg=1024`, `xl=1600` pixels, not
  the Figma frame widths (sm=390, md=768, lg=1280, xl=1600, from each mode's own
  `layout/viewport/width` token), which are where a mode was _designed_, not where its styles
  start _applying_.
- Figma's duplicated Web codeSyntax in `text.brand`, `surface.brand`, `spacing.gap`, and one
  legacy `fontSize` entry remains in an exact compatibility allowlist. Existing output names
  are unchanged; new collisions fail. The design-system team should correct the source names
  before the allowlist is removed.
- Legacy fixed typography preview objects are validated but not emitted; responsive
  `Breakpoint/*` plus `Base/Base` remains the production typography source.
- Four human-readable font-weight labels are normalized to their numeric path values, and
  the unpopulated `heading.2xl` responsive style remains a warning. See `reports/issues.md`.

## Extending it

- **Change which color is "primary", "secondary" and so on** → edit the `SHADCN_MAP` object
  near the top of `scripts/generate.mjs`. It is the one hand-picked mapping in the whole
  pipeline. Everything else is derived from the export automatically.
- **Change schema, naming exceptions, or breakpoint values** → edit `token.config.mjs`.
- **A new component needs a token that isn't exposed to Tailwind's `@theme` yet** → add a
  line in the `@theme inline` section of `writeThemeCss()` in `scripts/generate.mjs`,
  pointing at the existing `--abc-*` semantic variable.
