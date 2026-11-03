# abc-sites: Claude Code guide

Next.js 16 (App Router, Cache Components) head app for the abc sites on SitecoreAI, built with
the Sitecore Content SDK 2.x. This file holds the frontend team's standards. Content SDK, routing,
caching and proxy guardrails live in `AGENTS.md`, imported below.

@AGENTS.md

Background for humans: `docs/PROJECT-FOUNDATION.md`. Token pipeline: `design-tokens/README.md`.
Icons: `docs/ICONS.md`. For deeper SDK topics open **one** file under `.agents/docs/`, or pick one
skill from `Skills.md`.

## Commands

```bash
npm run storybook             # design system only, no Sitecore credentials needed
npm run dev                   # the site, needs .env.local (see .env.remote.example)
npm run verify                # lint, format, tests, a11y, tokens, icons, Storybook build
npm run type-check            # also run by CI; works offline after the two commands below
npm run sitecore-tools:generate-map && npm run sitecore-tools:build:offline
npm run fix                   # eslint --fix, then prettier --write
npm run tokens:build          # after design-tokens/figma-export.json changes
npm run icons:build           # after adding SVGs, see docs/ICONS.md
npx sitecore-tools project component scaffold features/<Group>/<Name>/<Name>
```

## Two trees

```
src/design-system/   FE. Storybook-level UI. Knows nothing about Sitecore.
  design/              tokens, icons, logos (Storybook "Design")
  ui/                  generated shadcn base UI (components.json points here)
  atoms/               one element each, folder is Base-prefixed: atoms/BaseImage/
  molecules/ organisms/
  lib/cn.ts            class merging
  tokens/generated/    GENERATED CSS, never edit
src/components/      Sitecore renderings. Every .tsx here is scanned into the rendering map.
  foundation/          shared field helpers (.ts only, excluded from the map)
  features/<Group>/    one rendering per folder: features/Navigation/BaseButton/
  Project/<site>/      site-specific renderings (abc, abc-health, abc-heart)
  sxa/                 SXA out-of-the-box renderings
  content-sdk/         SDK plumbing mounted by Layout/Scripts, excluded from the map
```

- `design-system/` never imports from `components/`. A rendering adapts a design-system
  component to Sitecore, never the other way round.
- Dependencies point down: `Project` → `features` → `foundation`. A feature never imports
  another feature; move the shared part to `foundation/` or `design-system/`.
- Stories and tests belong to `design-system/`, not to renderings.

## Renderings

- **The filename is the rendering name.** `features/PageContent/HeadingText/HeadingText.tsx`
  registers as `HeadingText` and must match the rendering item exactly. Names are unique across
  all of `src/components/`. Renaming the file renames the rendering.
- **No `index.ts`/`index.tsx` under `src/components/`.** It would register a rendering named
  `index`.
- **Variants are named exports** (`Default`, `Secondary`, …) and match the rendering's Headless
  Variants in Sitecore.
- **Props live in a kebab-case sidecar,** `heading-text.props.ts`, excluded from the map. The
  scaffold command writes both files. Rerun `npm run sitecore-tools:generate-map` after adding,
  renaming or removing a rendering.
- Read data with `getDatasource` and `getFieldValue` from `@/lib/component-props`. Treat every
  field as possibly missing.
- With no datasource, render nothing on the published page and an `is-empty-hint` in Page
  Builder. Empty fields still render while editing so authors can fill them in.
- Pass `params.RenderingIdentifier` as `id` and `params.styles` as `className` on the root.
  Without them, author style picks and anchor links silently do nothing.
- Render content through SDK field components (`<Text field>`, `<RichText field>`), not
  `field.value`, so it stays editable in Page Builder.
- Author style options arrive as plain class names (`button-icon-right`,
  `description-text-size-l`). Style them in CSS. A Tailwind class an author types is stripped
  from the production build, because Tailwind only ships classes it can see in source.

## Design-system modules

```
atoms/BaseImage/
  BaseImage.tsx        source, PascalCase .tsx
  index.ts             public API (barrels are fine in design-system/)
  stories/             Storybook only. Application code never imports from it
  tests/               every test for the module. Never beside the source, never __tests__/
```

- Story titles start with the level: `Atoms/Image`, `Design/Icons`. Atom titles drop `Base`.
- No stories under `ui/`. It is generated, so story the atom that wraps it.
- A component without a story is a component axe never checks. Write the story.

## Styling and tokens

- Every colour, size and spacing value comes from the Figma export through `npm run tokens:build`.
  Use **semantic** tokens (`--abc-surface-brand-brand-1`), never primitives
  (`--abc-color-...`) or raw hex.
- Breakpoints are 480 / 1024 / 1600px on `md:` / `lg:` / `xl:`. Tailwind's `sm:` and `2xl:` are
  switched off and compile to nothing.
- `src/app/globals.css` is the one stylesheet. The site loads it, and Storybook loads it through
  `.storybook/storybook.css`. Anything a class depends on (theme keys, variants, base styles)
  goes in `globals.css`, never in `storybook.css`.
- The design-tokens import block in `globals.css` is rewritten by `tokens:build`. Do not edit it.
- Lub Dub loads through `next/font/local` in `src/design-system/fonts/lub-dub.ts`, applied as a
  class on every `<html>` root. Never add `@font-face` or font files under `public/`: next/font
  is what gives preloading, immutable caching and a size-adjusted fallback.

## Imports and formatting

- TypeScript imports use `@/` (`@/design-system/...`, `@/components/...`, `@/lib/...`).
  `@design-tokens/generated/tokens` is the runtime token module. Do not climb with `../../`.
- Some scaffolded files use bare `src/`, `lib/` and `components/` aliases. Leave them, but do not
  use them in new code.
- **CSS `@import` must be relative.** Tailwind resolves CSS imports itself and does not read
  tsconfig `paths`, so `@/` fails there with "Can't resolve".
- Prettier owns layout. `.prettierrc.json` matches abc-site-fe: 100 columns, single quotes,
  double quotes in CSS, trailing commas (es5), LF. Files listed at the bottom of `.prettierignore`
  are kept byte-for-byte; do not reformat them.

## Accessibility

A cardiac-health site, so WCAG 2.1 AA is the floor. `jsx-a11y` runs in lint, and
`npm run test:storybook` fails on any axe violation. That catches roughly a third of failures.
Keyboard order, focus, screen-reader output, 200% zoom and 320px reflow are checked by hand.
Prefer semantic elements over `div` with ARIA, give every control an accessible name, and never
use colour as the only signal.

## Never edit by hand

`.sitecore/` (except via the CLI), `src/design-system/tokens/generated/`,
`design-tokens/generated/`, `design-tokens/reports/`, `**/*.generated.ts`, `next-env.d.ts`.
Regenerate and commit the result. CI fails when a committed file differs from what its build
produces.

## Write plain code

Comments explain **why**, never what. No ceremonial JSDoc, no handling of impossible states, no
abstraction with one caller, no `any` or `as` casts papering over a type problem. Extract on the
third repetition, and extract a component rather than a helper when the thing renders.
