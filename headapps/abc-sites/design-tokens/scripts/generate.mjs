#!/usr/bin/env node
/**
 * abc Design Tokens. Generate
 * ------------------------------
 * The one script that runs the whole pipeline: reads the Figma export, turns it into
 * Tailwind-ready CSS, and reports what changed. Run it with `npm run tokens:build`.
 *
 * See design-tokens/README.md for the full walkthrough. Short version:
 *
 *   design-tokens/figma-export.json  (input)
 *           │
 *           ▼  this script
 *   design-tokens/generated/tokens.json        canonical resolved snapshot (committed)
 *   design-tokens/generated/tokens.ts          shared runtime module (committed)
 *   design-tokens/reports/issues.{md,json}     validation findings (committed)
 *   design-tokens/reports/changes.{md,json}    what changed vs. the baseline (committed)
 *   src/design-system/tokens/generated/*.css                    the actual Tailwind output (committed)
 *
 * Flags:
 *   --strict            exit 1 if validation found an error (broken ref, name collision, …)
 *   --fail-on-breaking  exit 1 if a token was removed/renamed since the baseline
 *   --pinned            compare against generated/baseline.json instead of git HEAD
 *   --baseline=<path>   compare against a specific file instead
 *   --verbose           also print warnings, not just errors
 *
 * Validation always runs before this script writes an output.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  BREAKPOINTS,
  BREAKPOINT_ORDER,
  SKIP_PRIMITIVE_GROUPS,
  TOKEN_SOURCE,
  TYPOGRAPHY_PREVIEW_GROUPS,
} from '../token.config.mjs';
import {
  extractFigmaVariable,
  getCssVariableName,
  isKnownCodeSyntaxCollision,
  toKebabPath,
  toKebabSegment,
} from './naming.mjs';
import { buildRuntimeTokenData, renderTypeScriptModule } from './runtime-output.mjs';
import { formatMotionValue } from './motion-output.mjs';
import { formatValidationErrors, validateTokenFile } from './validate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // design-tokens/scripts/
const PKG_DIR = path.resolve(__dirname, '..'); // design-tokens/
const ROOT = path.resolve(__dirname, '../..'); // repo root

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const verbose = args.includes('--verbose');
const failOnBreaking = args.includes('--fail-on-breaking');
const usePinned = args.includes('--pinned');
const pin = args.includes('--pin'); // lock in this build as the new baseline + auto-write a CHANGELOG.md entry
const getArg = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const explicitBaseline = getArg('baseline');
const inputArg = args.find((a) => !a.startsWith('--'));
const INPUT_PATH = path.resolve(ROOT, inputArg ?? TOKEN_SOURCE);

// ---------------------------------------------------------------------------
// Constants, the few things a human decided rather than the export dictating
// ---------------------------------------------------------------------------
// Composite groups inside `_Primitive/Value` that need custom composition instead of the
// generic leaf-by-leaf flatten (see composeShadowPresets below).
const SHADOW_PRESET_GROUPS = ['Shadows', 'Focus rings'];
// `Display/Heading/Body/Lead/Label` are a second, fixed-size (non-responsive) typography
// system that duplicates the real, responsive one built from Breakpoint/* + Base/Base (see
// composeTypography). We validate their references (some are broken in the export) but
// don't emit CSS from them.

// Breakpoint role name -> Base/Base role name, for family/weight lookup.
const ROLE_TO_BASE_ROLE = { display: 'display', text: 'body', heading: 'heading', label: 'label' };
// Only "display" has its own font family in Base/Base; everything else uses body's family.
const ROLE_TO_FAMILY_ROLE = { display: 'display' };
const DEFAULT_FAMILY_ROLE = 'body';
// The breakpoint sets call the paragraph-text role "text" (font.size.text.*); we surface it
// as "body" in generated names ("text-body-md", not the confusing "text-text-md").
const ROLE_DISPLAY_NAME = { text: 'body' };

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

// Values representing fixed shadow geometry stay in px. That's Tailwind's own convention
// for its default shadow tokens. Everything else that needs a unit (font sizes, spacing,
// radius, layout widths, …) becomes REM, so it scales with the user's root font size the
// same way Tailwind's own default scale does. Px would ignore browser text-size settings.
const REM_BASE_PX = 16;
const PX_EFFECT_NEEDLES = ['offset-x', 'offset-y', 'blur', 'spread'];
const REM_TYPE_MATCHES = [
  'dimension',
  'fontsize',
  'fontsizes',
  'sizing',
  'spacing',
  'borderradius',
  'borderwidth',
];
const REM_PATH_NEEDLES = [
  'spacing',
  'space',
  'font.size',
  'fontsize',
  'line-height',
  'lineheight',
  'letterspacing',
  'paragraphspacing',
  'paragraphindent',
  'radius',
  'width',
  'height',
  'gap',
  'gutter',
  'inset',
  'margin',
  'padding',
  'max-width',
  'size',
];

function classifyUnit(dotPath, type) {
  const p = dotPath.toLowerCase();
  const t = String(type ?? '').toLowerCase();
  if (
    t.includes('weight') ||
    p.includes('weight') ||
    p.includes('opacity') ||
    p.includes('z-index')
  )
    return 'none';
  if (PX_EFFECT_NEEDLES.some((n) => p.includes(n))) return 'px';
  if (REM_TYPE_MATCHES.includes(t)) return 'rem';
  return REM_PATH_NEEDLES.some((n) => p.includes(n)) ? 'rem' : 'none';
}

function formatNumber(value, dotPath, type) {
  if (value === 0) return '0';
  const unit = classifyUnit(dotPath, type);
  if (unit === 'none') return String(value);
  if (unit === 'px') return `${value}px`;
  const rem = Math.round((value / REM_BASE_PX) * 10000) / 10000; // trim float noise, keep up to 4dp
  return `${rem}rem`;
}

// ---------------------------------------------------------------------------
// Step 1. Load export, resolve token-set order
// ---------------------------------------------------------------------------

const validation = validateTokenFile(INPUT_PATH);
if (validation.errors.length > 0) {
  console.error(
    `Design-token validation failed before generation: ${validation.errors.length} error(s)\n`
  );
  console.error(formatValidationErrors(validation.errors));
  process.exit(1);
}
const source = validation.source;
const setOrder =
  Array.isArray(source.$metadata?.tokenSetOrder) && source.$metadata.tokenSetOrder.length
    ? source.$metadata.tokenSetOrder.filter((name) => source[name])
    : Object.keys(source).filter((k) => !k.startsWith('$'));

const PRIMITIVE_SET = setOrder.find((s) => s.startsWith('_Primitive')) ?? '_Primitive/Value';
const BASE_SET = setOrder.find((s) => s.startsWith('Base/')) ?? 'Base/Base';
const SEMANTIC_SET = setOrder.find((s) => s.startsWith('Color/')) ?? 'Color/Light';
const BREAKPOINT_SETS = Object.fromEntries(
  BREAKPOINT_ORDER.map((bp) => [bp, setOrder.find((s) => s === `Breakpoint/${bp}`)]).filter(
    ([, v]) => v
  )
);

const issues = []; // { severity: 'error'|'warning', kind, message, paths? }
const note = (severity, kind, message, extra = {}) =>
  issues.push({ severity, kind, message, ...extra });

// ---------------------------------------------------------------------------
// Step 2. Flatten each set into records, honouring skip-lists
// ---------------------------------------------------------------------------

function isTokenNode(node) {
  return Boolean(node && typeof node === 'object' && '$value' in node);
}

function walk(node, segments, setName, skipTopKeys, out) {
  if (!node || typeof node !== 'object') return;
  if (isTokenNode(node)) {
    out.push({
      path: segments.join('.'),
      segments: segments.slice(),
      setName,
      type: node.$type,
      value: node.$value,
      description: node.$description,
      figmaVar: extractFigmaVariable(node),
    });
    return;
  }
  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (segments.length === 0 && skipTopKeys?.has(key)) continue;
    walk(val, [...segments, key], setName, skipTopKeys, out);
  }
}

function flattenSet(setName, skipTopKeys) {
  const out = [];
  walk(source[setName], [], setName, skipTopKeys, out);
  return out;
}

const skipFromPrimitives = new Set([
  ...SHADOW_PRESET_GROUPS,
  ...SKIP_PRIMITIVE_GROUPS,
  ...TYPOGRAPHY_PREVIEW_GROUPS,
]);
const primitiveRecords = flattenSet(PRIMITIVE_SET, skipFromPrimitives);
const baseRecords = source[BASE_SET] ? flattenSet(BASE_SET, new Set()) : [];

/** Figma's `font.weight.<n>` primitives store a human LABEL as the raw value ("Semibold",
 * "Medium") even though the path segment is the real numeric CSS weight. "Semibold" is not
 * a valid CSS font-weight, so it would be silently ignored by the browser. We trust the
 * number already in the token's own path and patch the RAW value here, before resolution
 * runs, so every alias/reference that points at these primitives inherits the fix. */
for (const r of primitiveRecords) {
  const m = r.path.match(/^font\.weight\.(\d+)$/);
  if (!m) continue;
  const numeric = Number(m[1]);
  if (r.value !== numeric) {
    note(
      'warning',
      'non-numeric-font-weight',
      `${r.path} is "${r.value}" in Figma, which is not a valid CSS font-weight. Using ${numeric} (from the token's own path) instead.`,
      { path: r.path, figmaValue: r.value, usedInstead: numeric }
    );
    r.value = numeric;
  }
}
// Transition A is verified for BaseButton and Resource Downloads. Other motion roles
// remain outside this change, including the unrepresentable Transition D spring.
const controlMotionRecords = (setName) =>
  source[setName]
    ? flattenSet(setName, new Set()).filter((record) => record.path.startsWith('transition.A.'))
    : [];
const motionFullRecords = controlMotionRecords('Motion/Full');
const motionReducedRecords = controlMotionRecords('Motion/Reduced');
const semanticRecords = [...flattenSet(SEMANTIC_SET, new Set()), ...motionFullRecords];
const bpRecords = {};
for (const bp of BREAKPOINT_ORDER) {
  if (!BREAKPOINT_SETS[bp]) continue;
  bpRecords[bp] = flattenSet(BREAKPOINT_SETS[bp], new Set());
}

// "global" pool = everything reference lookups fall back to when not found locally
const globalByPath = new Map();
for (const r of [...primitiveRecords, ...baseRecords]) globalByPath.set(r.path, r);

const semanticByPath = new Map(semanticRecords.map((r) => [r.path, r]));
const bpByPath = {};
for (const bp of BREAKPOINT_ORDER) {
  if (!bpRecords[bp]) continue;
  bpByPath[bp] = new Map(bpRecords[bp].map((r) => [r.path, r]));
}

// ---------------------------------------------------------------------------
// Step 3. Reference resolution (recursive, cycle-safe)
// ---------------------------------------------------------------------------

function lookup(refPath, localMap) {
  return localMap?.get(refPath) ?? globalByPath.get(refPath);
}

/** Fully resolves a record's value to a literal (number/string). */
function resolveLiteral(record, localMap, seen = new Set()) {
  const raw = record.value;
  if (typeof raw !== 'string') return { ok: true, value: raw };

  const trimmed = raw.trim();
  const wholeRef = trimmed.match(/^\{([^{}]+)\}$/);

  const resolveOne = (refPath) => {
    refPath = refPath.trim();
    if (seen.has(refPath)) return { ok: false, error: `circular reference via {${refPath}}` };
    const refRecord = lookup(refPath, localMap);
    if (!refRecord) return { ok: false, error: `broken reference {${refPath}}` };
    seen.add(refPath);
    const result = resolveLiteral(refRecord, localMap, seen);
    seen.delete(refPath);
    return result;
  };

  if (wholeRef) return resolveOne(wholeRef[1]);

  let failure = null;
  const value = trimmed.replace(/\{([^{}]+)\}/g, (whole, refPath) => {
    const r = resolveOne(refPath);
    if (!r.ok) {
      failure = r.error;
      return whole;
    }
    return String(r.value);
  });
  return failure ? { ok: false, error: failure } : { ok: true, value };
}

// ---------------------------------------------------------------------------
// Step 4, Name resolution + collision repair
// ---------------------------------------------------------------------------

/**
 * Assigns a final CSS variable name to every record in a layer. Prefers the name the
 * designer already put in Figma (`$extensions.codeSyntax.Web`). But if two DIFFERENT token
 * paths land on the SAME name, a real issue found in the current export, e.g.
 * `text.brand.brand-1-primary` and `text.brand.brand-1-secondary` both declaring
 * `--abc-text-brand-primary`. Trusting Figma blindly would silently drop one of them.
 * Instead: detect the collision, report it, and fall back to a path-derived name for every
 * record in the group, no value is ever silently lost.
 *
 * Two passes, deliberately. A single pass has a real bug: a path-derived FALLBACK name
 * (from repairing one collision) can itself land on a name a completely different,
 * uninvolved token already legitimately owns (found in this export: `spacing.gap.xl`
 * collided with `spacing.gap.lg` over `--abc-spacing-gap-lg`, fell back to the path-derived
 * `--abc-spacing-gap-xl`, which turned out to be some OTHER token's actual Figma name,
 * so both silently ended up sharing one CSS declaration). Pass 1 only decides each record's
 * *tentative* name; pass 2 is what actually claims names, uniformly, so a second-order
 * clash like that gets caught and repaired too, regardless of processing order.
 */
function assignNames(records, layerLabel) {
  const byCandidate = new Map();
  for (const r of records) {
    const candidate = getCssVariableName({
      path: r.path,
      segments: r.segments,
      figmaVariable: r.figmaVar,
    });
    if (!byCandidate.has(candidate)) byCandidate.set(candidate, []);
    byCandidate.get(candidate).push(r);
  }

  // Pass 1: tentative name. The Figma-declared/derived candidate if nothing else wants it,
  // or a path-derived fallback if it collided with another token over the same candidate.
  for (const [candidate, group] of byCandidate) {
    if (group.length === 1) {
      group[0].tentativeName = candidate;
      continue;
    }
    const knownCompatibilityCollision = isKnownCodeSyntaxCollision(
      layerLabel,
      candidate,
      group.map((record) => record.path)
    );
    note(
      knownCompatibilityCollision ? 'warning' : 'error',
      knownCompatibilityCollision ? 'known-name-collision' : 'name-collision',
      `${group.length} tokens in ${layerLabel} all declare the CSS name ${candidate} in Figma. ` +
        `falling back to path-derived names so no value is lost. Fix the codeSyntax in Figma.`,
      { name: candidate, paths: group.map((g) => g.path) }
    );
    for (const r of group) r.tentativeName = `--abc-${toKebabPath(r.segments)}`;
  }

  // Pass 2: claim final names, one record at a time, in stable source order. Catches a
  // tentative name, original or fallback, landing on one another already-taken.
  const used = new Set();
  for (const r of records) {
    let finalName = r.tentativeName;
    if (used.has(finalName)) {
      note(
        'warning',
        'name-collision-fallback',
        `${r.path} in ${layerLabel} would be named ${finalName}, but another token already claimed that name, using a numbered fallback instead. Fix the codeSyntax in Figma.`,
        { path: r.path, name: finalName }
      );
      let suffix = 2;
      while (used.has(`${finalName}-${suffix}`)) suffix++;
      finalName = `${finalName}-${suffix}`;
    }
    r.cssName = finalName;
    used.add(finalName);
    delete r.tentativeName;
  }
  return records;
}

assignNames([...primitiveRecords, ...baseRecords], 'primitives');
assignNames(semanticRecords, 'Color/Light');
assignNames(motionReducedRecords, 'Motion/Reduced');
// Breakpoints share ONE name per dotPath across sm/md/lg/xl (that's what makes the
// @media-override mechanism work), compute names once from the base breakpoint, then
// copy the same name onto the other breakpoints' records for the same path.
if (bpRecords.sm) {
  assignNames(bpRecords.sm, 'Breakpoint/sm (base)');
  const nameByPath = new Map(bpRecords.sm.map((r) => [r.path, r.cssName]));
  for (const bp of BREAKPOINT_ORDER) {
    if (bp === 'sm' || !bpRecords[bp]) continue;
    for (const r of bpRecords[bp]) {
      r.cssName = nameByPath.get(r.path);
      if (!r.cssName)
        note(
          'warning',
          'breakpoint-mismatch',
          `${r.path} exists in Breakpoint/${bp} but not in the sm base, skipped from @media generation.`,
          { path: r.path, breakpoint: bp }
        );
    }
  }
}

// ---------------------------------------------------------------------------
// Step 5. Resolve every record's literal value + record broken refs
// ---------------------------------------------------------------------------

/**
 * If a record's raw Figma value is a PURE single reference (e.g. `{color.neutral.900}`,
 * nothing else in the string), returns the CSS name of the token it points at, so the CSS
 * output can say `var(--abc-color-neutral-900)` instead of copying the literal value.
 * This is what actually wires semantic.css to primitives.css (and breakpoint tokens to
 * primitives.css) in the generated CSS, so the primitive stays the one editable source and
 * everything downstream updates by inheritance, and so it's inspectable in devtools. The
 * literal is still resolved separately (see resolveLiteral) for tokens.json, since the
 * change-report needs an actual comparable value, not a variable name.
 */
function resolveCssRef(record, localMap) {
  if (typeof record.value !== 'string') return null;
  const m = record.value.trim().match(/^\{([^{}]+)\}$/);
  if (!m) return null; // literal value, or an interpolated/partial reference, no chaining
  const target = lookup(m[1].trim(), localMap);
  return target?.cssName ?? null;
}

function resolveAll(records, localMap, layerLabel) {
  for (const r of records) {
    const result = resolveLiteral(r, localMap);
    if (result.ok) {
      r.resolved = result.value;
      r.cssRef = resolveCssRef(r, localMap);
    } else {
      r.resolved = undefined;
      r.cssRef = undefined;
      note(
        'error',
        'broken-reference',
        `${layerLabel}, ${r.path}: ${result.error} (raw value "${r.value}")`,
        { path: r.path }
      );
    }
  }
}
resolveAll(primitiveRecords, null, 'primitives');
resolveAll(baseRecords, null, 'Base/Base');
resolveAll(semanticRecords, semanticByPath, SEMANTIC_SET);
resolveAll(
  motionReducedRecords,
  new Map(motionReducedRecords.map((r) => [r.path, r])),
  'Motion/Reduced'
);
for (const bp of BREAKPOINT_ORDER) {
  if (bpRecords[bp]) resolveAll(bpRecords[bp], bpByPath[bp], `Breakpoint/${bp}`);
}
// Validate (but don't emit) the non-responsive typography preview objects, purely so
// broken references in them are still reported.
for (const group of TYPOGRAPHY_PREVIEW_GROUPS) {
  if (!source[PRIMITIVE_SET]?.[group]) continue;
  const preview = [];
  walk(source[PRIMITIVE_SET][group], [group], PRIMITIVE_SET, new Set(), preview);
  // Preview typography refers to breakpoint-mode line-height tokens. Resolve against the
  // mobile base rather than reporting those valid cross-set aliases as missing.
  resolveAll(
    preview,
    bpByPath.sm,
    `${PRIMITIVE_SET} / ${group} (not emitted. See design-tokens/README.md)`
  );
}

// ---------------------------------------------------------------------------
// Step 6, Compose the responsive typography shorthand from Breakpoint/* + Base/Base
// ---------------------------------------------------------------------------

function composeTypography() {
  const shorthands = [];
  const groupsByRoleSize = new Map(); // "role.size" -> { size_: {bp: record}, line: {bp: record} }

  for (const bp of BREAKPOINT_ORDER) {
    if (!bpRecords[bp]) continue;
    for (const r of bpRecords[bp]) {
      const m = r.path.match(/^font\.(size|line-height)\.([a-z]+)\.([a-z0-9]+)$/);
      if (!m) continue;
      const [, field, role, size] = m;
      const key = `${role}.${size}`;
      if (!groupsByRoleSize.has(key))
        groupsByRoleSize.set(key, { role, size, size_: {}, line: {} });
      const entry = groupsByRoleSize.get(key);
      (field === 'size' ? entry.size_ : entry.line)[bp] = r;
    }
  }

  for (const { role, size, size_, line } of groupsByRoleSize.values()) {
    const familyRole = ROLE_TO_FAMILY_ROLE[role] ?? DEFAULT_FAMILY_ROLE;
    const familyRecord = globalByPath.get(`font.family.${familyRole}`);
    const weightRole = ROLE_TO_BASE_ROLE[role] ?? role;
    const weightRecord = globalByPath.get(`font.weight.${weightRole}`);
    const displayRole = ROLE_DISPLAY_NAME[role] ?? role;
    if (!familyRecord)
      note(
        'warning',
        'typography-missing-family',
        `No font.family.${familyRole} for role "${role}" (used by text-${displayRole}-${size}).`
      );
    if (!weightRecord)
      note(
        'warning',
        'typography-missing-weight',
        `No font.weight.${weightRole} for role "${role}" (used by text-${displayRole}-${size}).`
      );

    // `name` becomes the real Tailwind `--text-*` namespace entry in theme.css's @theme
    // inline block (so `text-body-lg` is a genuine font-size utility). `varPrefix` is for
    // the size/line/family/weight helper vars below. Kept off the `--text-` namespace on
    // purpose, since Tailwind treats ANY `--text-<key>` in @theme as a font-size scale entry,
    // and would otherwise misread `--text-body-lg-line`/`-family`/`-weight` as more (wrong)
    // font-size utilities the moment these vars move into an actual @theme block.
    const name = `--text-${displayRole}-${size}`;
    const varPrefix = `--abc-text-${displayRole}-${size}`;
    const sizeByBp = {};
    const lineByBp = {};
    for (const bp of BREAKPOINT_ORDER) {
      if (size_[bp]?.resolved !== undefined) sizeByBp[bp] = size_[bp].resolved;
      else
        note(
          'warning',
          'typography-missing-size',
          `text-${displayRole}-${size} has no resolvable font-size at breakpoint "${bp}".`
        );
      if (line[bp]?.resolved !== undefined) lineByBp[bp] = line[bp].resolved;
      // line-height is allowed to be missing. Several are broken refs in the current
      // export; the shorthand still works without it.
    }
    shorthands.push({
      role: displayRole,
      size,
      name,
      varPrefix,
      family: familyRecord?.resolved,
      // The CSS references the family role instead of repeating its value, so the app can swap
      // in its own font stack in one place (next/font, see src/design-system/fonts/lub-dub.ts).
      familyVar: familyRecord?.cssName,
      weight: weightRecord?.resolved,
      sizeByBp,
      lineByBp,
    });
  }
  return shorthands.sort((a, b) => a.name.localeCompare(b.name));
}
const typography = composeTypography();

// ---------------------------------------------------------------------------
// Step 7, Compose shadow / focus-ring presets from the decomposed primitives
// ---------------------------------------------------------------------------

function composeShadowPresets() {
  const presets = [];
  for (const groupName of SHADOW_PRESET_GROUPS) {
    const root = source[PRIMITIVE_SET]?.[groupName];
    if (!root) continue;
    for (const [presetName, layersNode] of Object.entries(root)) {
      if (presetName.startsWith('$')) continue;
      const layers = Object.keys(layersNode)
        .filter((k) => !k.startsWith('$'))
        .sort((a, b) => Number(a) - Number(b))
        .map((idx) => {
          const layerRecords = [];
          walk(
            layersNode[idx],
            [groupName, presetName, idx],
            PRIMITIVE_SET,
            new Set(),
            layerRecords
          );
          return Object.fromEntries(
            layerRecords.map((r) => [r.segments.at(-1), resolveLiteral(r, null)])
          );
        });
      const cssLayers = layers
        .filter((l) => l.color?.ok && l.x?.ok && l.y?.ok && l.blur?.ok && l.spread?.ok)
        .map((l) => {
          const inset = l.type?.value === 'innerShadow' ? 'inset ' : '';
          const px = (v) => `${v}px`; // shadow geometry stays in px. See classifyUnit
          return `${inset}${px(l.x.value)} ${px(l.y.value)} ${px(l.blur.value)} ${px(l.spread.value)} ${l.color.value}`;
        });
      if (cssLayers.length === 0) {
        note(
          'warning',
          'shadow-unresolved',
          `${groupName}/${presetName} had no fully-resolvable layers, skipped.`
        );
        continue;
      }
      // Figma already names these sensibly ("shadow-sm", "focus-ring-error"). They get the
      // same --abc- prefix as every other token: a bare --shadow-sm would land in Tailwind's
      // own --shadow-* namespace and silently replace the stock `shadow-sm` utility. The
      // alias block in writeSemanticCss() re-exposes these as `shadow-abc-sm` instead.
      presets.push({ name: `--abc-${toKebabSegment(presetName)}`, value: cssLayers.join(', ') });
    }
  }
  return presets;
}
const shadowPresets = composeShadowPresets();

// ---------------------------------------------------------------------------
// Step 8. Write generated data + the validation report
// ---------------------------------------------------------------------------

function toSnapshotEntries(records) {
  return records
    .filter((r) => r.resolved !== undefined)
    .map((r) => ({ path: r.path, name: r.cssName, value: r.resolved, type: r.type }));
}

const snapshot = {
  // No generatedAt timestamp here on purpose: this file is committed, and git already
  // records exactly when each version was generated (the commit date). A stored
  // timestamp would just make every rebuild show a diff even when nothing real changed.
  source: path.basename(INPUT_PATH),
  primitives: toSnapshotEntries([...primitiveRecords, ...baseRecords]),
  semantic: toSnapshotEntries(semanticRecords),
  motion: { reduced: toSnapshotEntries(motionReducedRecords) },
  breakpoints: Object.fromEntries(
    BREAKPOINT_ORDER.filter((bp) => bpRecords[bp]).map((bp) => [
      bp,
      toSnapshotEntries(bpRecords[bp]),
    ])
  ),
  typography: typography.map(
    ({ role, size, name, varPrefix, family, weight, sizeByBp, lineByBp }) => ({
      role,
      size,
      name,
      varPrefix,
      family,
      weight,
      sizeByBp,
      lineByBp,
    })
  ),
  shadows: shadowPresets,
};

fs.mkdirSync(path.join(PKG_DIR, 'generated'), { recursive: true });
fs.writeFileSync(
  path.join(PKG_DIR, 'generated/tokens.json'),
  JSON.stringify(snapshot, null, 2) + '\n'
);

const runtimeValueForRecord = (record) => {
  if (record.type === 'cubicBezier') return formatMotionValue(record);
  if (typeof record.resolved !== 'number') return record.resolved;
  return classifyUnit(record.path, record.type) === 'none'
    ? record.resolved
    : formatNumber(record.resolved, record.path, record.type);
};
const runtimeTokenData = buildRuntimeTokenData({
  primitiveRecords,
  baseRecords,
  semanticRecords,
  breakpointRecords: bpRecords,
  breakpointOrder: BREAKPOINT_ORDER,
  breakpoints: BREAKPOINTS,
  typography: typography.map((style) => ({
    ...style,
    sizeByBp: Object.fromEntries(
      Object.entries(style.sizeByBp).map(([bp, value]) => [
        bp,
        formatNumber(value, 'font.size', 'number'),
      ])
    ),
    lineByBp: Object.fromEntries(
      Object.entries(style.lineByBp).map(([bp, value]) => [
        bp,
        formatNumber(value, 'line-height', 'number'),
      ])
    ),
  })),
  shadows: shadowPresets,
  valueForRecord: runtimeValueForRecord,
});
fs.writeFileSync(
  path.join(PKG_DIR, 'generated/tokens.ts'),
  renderTypeScriptModule(runtimeTokenData, path.basename(INPUT_PATH))
);

fs.mkdirSync(path.join(PKG_DIR, 'reports'), { recursive: true });

function formatIssuesMarkdown() {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  let out = '# Design Token Validation Report\n\n';
  out += `Source: \`${path.basename(INPUT_PATH)}\`\n\n`; // no timestamp. This file is committed; git records when it changed
  out += `${errors.length} error(s), ${warnings.length} warning(s).\n\n`;
  if (errors.length) {
    out += '## Errors\n\n';
    for (const i of errors) out += `- **[${i.kind}]** ${i.message}\n`;
    out += '\n';
  }
  if (warnings.length) {
    out += '## Warnings\n\n';
    for (const i of warnings) out += `- **[${i.kind}]** ${i.message}\n`;
    out += '\n';
  }
  if (!errors.length && !warnings.length) out += 'No issues found.\n';
  return out;
}
// NOTE: issues.json / issues.md are NOT written here. See the end of Step 9b below. Every
// check that can call note() must run first, or its finding silently never reaches the file
// (it still reaches the console, since that prints from the same `issues` array much later,
// which is exactly the bug that made the globals.css check below necessary to double-check).

// ---------------------------------------------------------------------------
// Step 9. Write CSS
// ---------------------------------------------------------------------------

const GENERATED_HEADER = (name) => `/**
 * AUTO-GENERATED by design-tokens/scripts/generate.mjs from ${path.basename(INPUT_PATH)}
 * Do not edit by hand. Your changes will be overwritten on the next \`npm run tokens:build\`.
 * ${name}
 */\n`;

function cssLine(record) {
  if (record.cssRef) return `  ${record.cssName}: var(${record.cssRef});`;
  const value =
    typeof record.resolved === 'number'
      ? formatNumber(record.resolved, record.path, record.type)
      : formatMotionValue(record);
  return `  ${record.cssName}: ${value};`;
}

// ---------------------------------------------------------------------------
// Tailwind utility aliases
// ---------------------------------------------------------------------------
// Figma's codeSyntax stays the canonical name (--abc-buttons-height-md), so CSS copied
// straight out of Figma pastes in and works verbatim. But Tailwind only builds utility
// classes from variables whose name BEGINS with one of its namespaces (--color-*,
// --spacing-*, --radius-*, --shadow-*, ...). The namespace has to come first. An --abc-*
// name therefore produces no utility at all, which is also why editor autocomplete has
// nothing to offer for it: there is no class to suggest.
//
// Each alias below re-exposes one semantic token under a real namespace while keeping "abc"
// as the first segment of the key, so no Tailwind default is ever shadowed:
//   --abc-buttons-height-md  ->  --spacing-abc-buttons-height-md  ->  min-h-abc-buttons-height-md
//   --abc-surface-brand-brand-1 -> --color-abc-surface-brand-brand-1 -> bg-abc-surface-brand-brand-1
// Both spellings stay valid; the alias is purely additive.
const ALIAS_SKIP_PATH_PREFIXES = [
  'shadow.', // decomposed offset/blur/spread parts. The composed presets are the usable form
  'effect.', // per-layer shadow colors, same reason
  'color.effect.',
  'font.size.', // raw inputs to the composed --text-<role>-<size> scale, which already exists
  'font.line-height.',
  'transform.', // unitless scale/translate values with no matching Tailwind namespace
  'breakpoint.', // --abc-breakpoint-name is a label, not a value
];

function tailwindAlias(record) {
  const p = String(record.path).toLowerCase();
  if (ALIAS_SKIP_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))) return null;
  if (!record.cssName.startsWith('--abc-')) return null;
  const key = record.cssName.slice('--abc-'.length);
  if (String(record.type).toLowerCase() === 'color') return `--color-abc-${key}`;
  if (p.startsWith('radius.')) return `--radius-abc-${key}`;
  // Everything else that carries a real length unit drives the spacing scale, which is what
  // p-*, m-*, gap-*, w-*, h-*, min-h-*, max-w-* and inset-* are all generated from.
  if (classifyUnit(record.path, record.type) === 'rem') return `--spacing-abc-${key}`;
  return null;
}

function writePrimitivesCss() {
  // @theme (not :root) so Tailwind, and its IntelliSense extension, actually registers
  // these as theme variables. None of our --abc-* names match a Tailwind namespace prefix
  // (--color-*, --spacing-*, etc.), so this generates zero new utility classes; it only makes
  // the variables visible to `var()` completion and Tailwind's own theme introspection. The
  // one deliberate exception is the --shadow-*/--focus-ring* presets below, which DO match
  // Tailwind's real --shadow-* namespace on purpose, see composeShadowPresets().
  const lines = [
    GENERATED_HEADER(
      'Primitives, raw values. Do not use these directly in components; use the semantic layer.'
    ),
    '@theme {',
  ];
  for (const r of [...primitiveRecords, ...baseRecords]) {
    if (r.resolved === undefined) continue;
    lines.push(cssLine(r));
  }
  for (const preset of shadowPresets) lines.push(`  ${preset.name}: ${preset.value};`);
  lines.push('}', '');
  fs.writeFileSync(
    path.join(ROOT, 'src/design-system/tokens/generated/primitives.css'),
    lines.join('\n')
  );
}

function writeSemanticCss() {
  // @theme for the same reason as primitives.css. The typography helper vars below
  // deliberately use `t.varPrefix` (--abc-text-*), not `t.name` (--text-*). `--text-*` is a
  // real Tailwind namespace, and a bare :root variable named e.g. --text-body-lg-line sitting
  // inside @theme gets misread as its own (wrong) font-size utility the instant it's in
  // scope. `t.name` is reserved for theme.css's @theme inline block, which hooks into that
  // namespace on purpose to generate the real `text-body-lg` utility. See composeTypography().
  const lines = [
    GENERATED_HEADER(
      'Semantic + responsive tokens. Components use these, never the primitives above.'
    ),
    '@theme {',
  ];
  for (const r of semanticRecords) {
    if (r.resolved === undefined) continue;
    lines.push(cssLine(r));
  }
  const base = bpRecords.sm ?? [];
  for (const r of base) {
    if (r.resolved === undefined) continue;
    lines.push(cssLine(r));
  }
  for (const t of typography) {
    if (t.sizeByBp.sm !== undefined)
      lines.push(`  ${t.varPrefix}-size: ${formatNumber(t.sizeByBp.sm, 'font.size', 'number')};`);
    if (t.lineByBp.sm !== undefined)
      lines.push(`  ${t.varPrefix}-line: ${formatNumber(t.lineByBp.sm, 'line-height', 'number')};`);
    if (t.familyVar !== undefined) lines.push(`  ${t.varPrefix}-family: var(${t.familyVar});`);
    else if (t.family !== undefined) lines.push(`  ${t.varPrefix}-family: ${t.family};`);
    if (t.weight !== undefined) lines.push(`  ${t.varPrefix}-weight: ${t.weight};`);
  }
  lines.push('}', '');

  // Responsive overrides, one @media block per non-base breakpoint, only the vars whose
  // value actually differs from the base. Plain (unlayered) :root, not @theme. @theme can't
  // live inside @media, and unlayered CSS always wins over the @layer theme output that
  // Tailwind compiles the block above into, so this still correctly overrides it when the
  // media query matches.
  for (const bp of BREAKPOINT_ORDER) {
    if (BREAKPOINTS[bp].isBase || !bpRecords[bp]) continue;
    const overrides = [];
    for (const r of bpRecords[bp]) {
      const baseRecord = bpByPath.sm?.get(r.path);
      if (r.resolved === undefined) continue;
      if (baseRecord && baseRecord.resolved === r.resolved) continue;
      overrides.push(cssLine(r));
    }
    for (const t of typography) {
      if (t.sizeByBp[bp] !== undefined && t.sizeByBp[bp] !== t.sizeByBp.sm) {
        overrides.push(
          `  ${t.varPrefix}-size: ${formatNumber(t.sizeByBp[bp], 'font.size', 'number')};`
        );
      }
      if (t.lineByBp[bp] !== undefined && t.lineByBp[bp] !== t.lineByBp.sm) {
        overrides.push(
          `  ${t.varPrefix}-line: ${formatNumber(t.lineByBp[bp], 'line-height', 'number')};`
        );
      }
    }
    if (overrides.length === 0) continue;
    lines.push(
      `@media (min-width: ${BREAKPOINTS[bp].px}px) {`,
      '  :root {',
      ...overrides.map((l) => `  ${l}`),
      '  }',
      '}',
      ''
    );
  }

  if (motionReducedRecords.length) {
    lines.push(
      '@media (prefers-reduced-motion: reduce) {',
      '  :root {',
      ...motionReducedRecords.map((record) => `  ${cssLine(record)}`),
      '  }',
      '}',
      ''
    );
  }

  // @theme inline, not @theme: inline keeps the var() indirection inside the generated
  // utility, which is what lets the responsive @media overrides above still take effect. A
  // plain @theme would resolve each alias to today's base value and freeze it at that width.
  const aliasLines = [];
  const claimedAliases = new Map();
  const claimAlias = (alias, sourceName) => {
    const previous = claimedAliases.get(alias);
    if (previous) {
      note(
        'error',
        'alias-collision',
        `${sourceName} and ${previous} both map to the Tailwind alias ${alias}. Only the first is emitted.`,
        { alias }
      );
      return;
    }
    claimedAliases.set(alias, sourceName);
    aliasLines.push(`  ${alias}: var(${sourceName});`);
  };
  for (const r of [...semanticRecords, ...(bpRecords.sm ?? [])]) {
    if (r.resolved === undefined) continue;
    const alias = tailwindAlias(r);
    if (alias) claimAlias(alias, r.cssName);
  }
  for (const preset of shadowPresets) {
    claimAlias(`--shadow-abc-${preset.name.replace(/^--abc-(shadow-)?/, '')}`, preset.name);
  }
  if (aliasLines.length > 0) {
    lines.push(
      '/* Tailwind utility aliases. See the note above tailwindAlias() in generate.mjs. */'
    );
    lines.push('@theme inline {', ...aliasLines, '}', '');
  }

  // @utility, not a plain `.text-<role>-<size>` ruleset. A plain class is invisible to
  // Tailwind, so `lg:text-body-lg` would silently fall through to whatever else answers to
  // that name and apply only part of the preset. Registering it as a utility means every
  // variant (lg:, hover:, group-*:) carries all four properties.
  //
  // Each still resizes on its own without any variant: the -size/-line vars are overridden
  // per breakpoint in the @media blocks above, so `text-body-lg` is already responsive.
  lines.push('/* Typography utilities, the full font shorthand, variant-capable. */');
  for (const t of typography) {
    lines.push(`@utility text-${t.role}-${t.size} {`);
    lines.push(`  font-family: var(${t.varPrefix}-family);`);
    lines.push(`  font-weight: var(${t.varPrefix}-weight);`);
    lines.push(`  font-size: var(${t.varPrefix}-size);`);
    lines.push(`  line-height: var(${t.varPrefix}-line);`);
    lines.push('}');
  }
  lines.push('');

  fs.writeFileSync(
    path.join(ROOT, 'src/design-system/tokens/generated/semantic.css'),
    lines.join('\n')
  );
}

/**
 * shadcn's fixed variable names -> our semantic token names. The one hand-curated mapping
 * table in the pipeline, a design decision ("primary = which brand color"), not something
 * derivable from the export. Review it in PRs like any other design choice.
 */
const SHADCN_MAP = {
  '--background': '--abc-surface-default-primary',
  '--foreground': '--abc-text-default-primary',
  '--card': '--abc-surface-default-primary',
  '--card-foreground': '--abc-text-default-primary',
  '--popover': '--abc-surface-default-primary',
  '--popover-foreground': '--abc-text-default-primary',
  '--primary': '--abc-surface-brand-brand-1', // abc red, base brand surface, not hover/secondary
  '--primary-foreground': '--abc-text-inverse-primary',
  '--secondary': '--abc-surface-brand-brand-2', // abc purple
  '--secondary-foreground': '--abc-text-inverse-primary',
  '--muted': '--abc-surface-default-secondary',
  '--muted-foreground': '--abc-text-default-tertiary',
  '--accent': '--abc-surface-default-secondary',
  '--accent-foreground': '--abc-text-default-primary',
  '--destructive': '--abc-feedback-error-bg-solid',
  '--destructive-foreground': '--abc-text-inverse-primary',
  // Error red as TEXT, for soft/tinted variants that put error text on an error-tinted
  // background rather than on the solid fill. `--destructive` is a background token
  // (error-600); using it for text on a 10% tint gives 4.15:1 and fails WCAG 1.4.3 AA.
  // The design system already authors error-800 for this, which measures 7.45:1 resting and
  // 6.36:1 hovered. See the destructive variant in src/design-system/ui/Button.tsx.
  '--destructive-text': '--abc-feedback-error-text-primary',
  '--border': '--abc-border-default-primary',
  '--input': '--abc-border-default-primary',
  '--ring': '--abc-border-focus',
};

function writeThemeCss() {
  const availableNames = new Set(semanticRecords.map((r) => r.cssName));
  const lines = [GENERATED_HEADER('Tailwind v4 @theme + shadcn variable mapping.'), ':root {'];
  for (const [shadcnVar, abcVar] of Object.entries(SHADCN_MAP)) {
    if (!availableNames.has(abcVar)) {
      note(
        'error',
        'shadcn-map-missing-token',
        `SHADCN_MAP maps ${shadcnVar} -> ${abcVar}, but no semantic token has that name. Check design-tokens/generated/tokens.json.`
      );
      continue;
    }
    lines.push(`  ${shadcnVar}: var(${abcVar});`);
  }
  const radius = globalByPath.get('radius.8');
  lines.push(
    `  --radius: ${radius ? formatNumber(radius.resolved, 'radius', 'number') : '0.5rem'};`
  );
  lines.push(
    '}',
    '',
    '.dark {',
    '  /* No Color/Dark set in the export yet, reserved for when dark mode ships. */',
    '}',
    ''
  );

  // Points straight at the --abc-* source rather than detouring through the shadcn-named
  // :root variable above. The :root copy (e.g. --primary) still exists and still resolves to
  // the same value. Shadcn's own generated components (button.tsx, card.tsx, ...) reference
  // it directly via raw var(--primary) inside arbitrary Tailwind values, so it can't be
  // removed. This just gives Tailwind's own utility generation (bg-primary etc.) one fewer
  // hop to resolve, independent of that.
  lines.push('@theme inline {');
  for (const [shadcnVar, abcVar] of Object.entries(SHADCN_MAP)) {
    lines.push(`  --color-${shadcnVar.slice(2)}: var(${abcVar});`);
  }
  lines.push('  --radius-sm: calc(var(--radius) * 0.6);');
  lines.push('  --radius-md: calc(var(--radius) * 0.8);');
  lines.push('  --radius-lg: var(--radius);');
  lines.push('  --radius-xl: calc(var(--radius) * 1.4);');
  if (globalByPath.get('font.family.body'))
    lines.push(`  --font-sans: var(--abc-font-family-body);`);
  // No --text-<role>-<size> entries here on purpose. Registering those in Tailwind's --text-*
  // namespace generated a SECOND `text-body-lg` utility that set font-size alone, colliding
  // by name with the full preset in semantic.css, the winner decided only by the
  // unlayered-beats-@layer rule. The @utility blocks there are now the single definition.
  lines.push('');
  lines.push(
    "  /* Realign Tailwind's responsive prefixes (md:/lg:/xl:) to the client's breakpoints. */"
  );
  lines.push(`  --breakpoint-md: ${BREAKPOINTS.md.px / REM_BASE_PX}rem;`);
  lines.push(`  --breakpoint-lg: ${BREAKPOINTS.lg.px / REM_BASE_PX}rem;`);
  lines.push(`  --breakpoint-xl: ${BREAKPOINTS.xl.px / REM_BASE_PX}rem;`);
  // Tailwind's stock sm (640px) and 2xl (1536px) are not in the spec. Left alone, sm becomes a
  // phantom fourth tier between md and lg, and 2xl fires BEFORE xl (1536 < 1600). Resetting
  // them means `sm:` / `2xl:` compile to nothing, so the only tiers are the three we define.
  lines.push('  --breakpoint-sm: initial;');
  lines.push('  --breakpoint-2xl: initial;');
  lines.push('}', '');

  fs.writeFileSync(
    path.join(ROOT, 'src/design-system/tokens/generated/theme.css'),
    lines.join('\n')
  );
}

fs.mkdirSync(path.join(ROOT, 'src/design-system/tokens/generated'), { recursive: true });
writePrimitivesCss();
writeSemanticCss();
writeThemeCss();

// ---------------------------------------------------------------------------
// Step 9b. Keep src/app/globals.css wired to the generated CSS, automatically
// ---------------------------------------------------------------------------
// The three files above are regenerated every run, but the @import lines that pull them
// into globals.css live inside a file this script doesn't otherwise own (it has other,
// hand-written content too). The three import lines themselves are purely mechanical.
// Always the same three strings, never something a human needs to compose, so instead of
// just flagging when they go missing, this rewrites a clearly-marked block that owns
// exactly those three lines and nothing else. Delete them, reorder them, whatever. The
// next `npm run tokens:build` puts them back, and says so (a warning, not an error: by the
// time you'd see it, it's already fixed).
// globals.css is the one stylesheet both the site and Storybook (.storybook/storybook.css
// imports it) load, so the tokens are wired in here and nowhere else.
const TOKEN_IMPORT_LINES = [
  '@import "../design-system/tokens/generated/primitives.css";',
  '@import "../design-system/tokens/generated/semantic.css";',
  '@import "../design-system/tokens/generated/theme.css";',
];
const TOKEN_IMPORT_MARKER_START =
  '/* BEGIN design-tokens imports. Managed by `npm run tokens:build`, do not edit by hand */';
const TOKEN_IMPORT_MARKER_END = '/* END design-tokens imports */';
const TOKEN_IMPORT_BLOCK = [
  TOKEN_IMPORT_MARKER_START,
  ...TOKEN_IMPORT_LINES,
  TOKEN_IMPORT_MARKER_END,
].join('\n');

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function ensureGlobalsCssWired() {
  const globalsCssPath = path.join(ROOT, 'src/app/globals.css');
  if (!fs.existsSync(globalsCssPath)) {
    note(
      'warning',
      'globals-css-missing',
      `${path.relative(ROOT, globalsCssPath)} not found. Could not wire in the generated CSS.`
    );
    return;
  }
  const original = fs.readFileSync(globalsCssPath, 'utf8');

  // Don't just look inside the marker block. Someone can move/copy the bare @import lines
  // without touching the markers (or copy the whole block a second time), leaving stray,
  // unmanaged duplicates anywhere else in the file (a real case this hit: the three lines
  // moved to the bottom, past @layer rules, where @import isn't even valid CSS any more).
  // So: strip every marker block AND every standalone copy of each import line, from
  // anywhere in the file, then re-insert exactly one. This makes the result the same
  // regardless of how many stray copies existed or where.
  let cleaned = original.replace(
    /\/\* BEGIN design-tokens imports[\s\S]*?\/\* END design-tokens imports \*\/\n?/g,
    ''
  );
  for (const line of TOKEN_IMPORT_LINES) {
    cleaned = cleaned.replace(new RegExp(`^[ \\t]*${escapeRegExp(line)}[ \\t]*\\n?`, 'gm'), '');
  }

  // Insert right after the last remaining top-of-file @import (tailwindcss, shadcn's own
  // CSS, …). CSS requires @import before any other rule, so this is also the only place
  // it's legal to put it.
  const lines = cleaned.split('\n');
  let insertAt = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^@import\s/.test(lines[i])) insertAt = i + 1;
  }
  lines.splice(insertAt, 0, '', TOKEN_IMPORT_BLOCK);
  const updated = lines.join('\n').replace(/\n{3,}/g, '\n\n'); // tidy up any blank-line buildup left by removals

  if (updated !== original) {
    fs.writeFileSync(globalsCssPath, updated);
    note(
      'warning',
      'globals-css-auto-wired',
      `src/app/globals.css's design-tokens imports were missing, edited, duplicated, or misplaced, normalized to a single, correctly-positioned copy automatically. Review the diff before committing.`
    );
  }
}
ensureGlobalsCssWired();

// Every check above (broken refs, collisions, the globals.css wiring check, …) has now run
// and had its chance to call note(). Safe to write the validation report.
fs.writeFileSync(path.join(PKG_DIR, 'reports/issues.json'), JSON.stringify(issues, null, 2) + '\n');
fs.writeFileSync(path.join(PKG_DIR, 'reports/issues.md'), `${formatIssuesMarkdown().trimEnd()}\n`);

// ---------------------------------------------------------------------------
// Step 10. Compare against the baseline and write the change report
// ---------------------------------------------------------------------------
// Baseline, in order of preference: --baseline=<path> · --pinned (generated/baseline.json,
// the last reviewed release) · default (git HEAD's committed tokens.json. "what does this
// PR change", since most runs happen inside a PR).

function loadBaseline() {
  if (explicitBaseline) {
    const p = path.resolve(ROOT, explicitBaseline);
    if (!fs.existsSync(p)) {
      console.error(`--baseline file not found: ${p}`);
      process.exit(1);
    }
    return { source: path.relative(ROOT, p), json: JSON.parse(fs.readFileSync(p, 'utf8')) };
  }
  if (usePinned) {
    const p = path.join(PKG_DIR, 'generated/baseline.json');
    if (!fs.existsSync(p)) {
      console.warn(
        'No pinned baseline yet (design-tokens/generated/baseline.json). Run "npm run tokens:baseline" once you\'re ready to pin one. Treating this as a first run.'
      );
      return { source: '(none. First run)', json: null };
    }
    return {
      source: 'design-tokens/generated/baseline.json',
      json: JSON.parse(fs.readFileSync(p, 'utf8')),
    };
  }
  try {
    const text = execFileSync('git', ['show', 'HEAD:design-tokens/generated/tokens.json'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'], // silence git's own "not in HEAD" noise
    });
    return { source: 'git HEAD', json: JSON.parse(text) };
  } catch {
    console.warn(
      'No committed design-tokens/generated/tokens.json at HEAD yet. Treating this as a first run. Everything below is "added".'
    );
    return { source: '(none. First run)', json: null };
  }
}

// Layer is known directly from the snapshot's own shape, more reliable than guessing it
// back out of the variable name.
function flattenSnapshot(snap) {
  const flat = new Map();
  if (!snap) return flat;
  const set = (name, value, layer) => flat.set(name, { value, layer });
  for (const e of snap.primitives ?? []) set(e.name, e.value, 'primitive');
  for (const e of snap.semantic ?? []) set(e.name, e.value, 'semantic');
  for (const e of snap.motion?.reduced ?? []) set(`${e.name}@reduced`, e.value, 'semantic');
  for (const [bp, entries] of Object.entries(snap.breakpoints ?? {})) {
    for (const e of entries) set(`${e.name}@${bp}`, e.value, 'breakpoint');
  }
  for (const t of snap.typography ?? []) {
    const prefix = t.varPrefix ?? t.name; // varPrefix is absent in snapshots pinned before this rename
    if (t.family !== undefined) set(`${prefix}-family`, t.family, 'typography');
    if (t.weight !== undefined) set(`${prefix}-weight`, t.weight, 'typography');
    for (const [bp, v] of Object.entries(t.sizeByBp ?? {}))
      set(`${prefix}-size@${bp}`, v, 'typography');
    for (const [bp, v] of Object.entries(t.lineByBp ?? {}))
      set(`${prefix}-line@${bp}`, v, 'typography');
  }
  for (const s of snap.shadows ?? []) set(s.name, s.value, 'shadow');
  return flat;
}

/** Diffs two flattened snapshots. Used for both the every-run change report (below) and
 * the CHANGELOG.md entry `--pin` writes automatically (see "Step 12"). */
function diffSnapshots(baseFlat, currFlat) {
  const removed = [];
  const added = [];
  const modified = [];
  let unchanged = 0;
  for (const [name, entry] of baseFlat) {
    if (!currFlat.has(name)) removed.push({ name, ...entry });
  }
  for (const [name, entry] of currFlat) {
    if (!baseFlat.has(name)) {
      added.push({ name, ...entry });
    } else {
      const before = baseFlat.get(name);
      if (before.value !== entry.value)
        modified.push({ name, before: before.value, after: entry.value, layer: entry.layer });
      else unchanged++;
    }
  }
  const sortByLayerThenName = (a, b) => {
    const order = { typography: 0, semantic: 1, breakpoint: 2, shadow: 3, primitive: 4 };
    return (order[a.layer] ?? 9) - (order[b.layer] ?? 9) || a.name.localeCompare(b.name);
  };
  [removed, added, modified].forEach((l) => l.sort(sortByLayerThenName));
  return { removed, added, modified, unchanged };
}

const baseline = loadBaseline();
const baseFlat = flattenSnapshot(baseline.json);
const currFlat = flattenSnapshot(snapshot); // diff against what we JUST built, no re-read needed
const { removed, added, modified, unchanged } = diffSnapshots(baseFlat, currFlat);
const semverSuggestion = removed.length
  ? 'MAJOR'
  : modified.length
    ? 'PATCH'
    : added.length
      ? 'MINOR'
      : null;

const changeReport = {
  baseline: baseline.source,
  summary: {
    baselineCount: baseFlat.size,
    currentCount: currFlat.size,
    unchanged,
    removed: removed.length,
    modified: modified.length,
    added: added.length,
    semverSuggestion,
  },
  removed,
  added,
  modified,
};

function formatChangesMarkdown() {
  let out = '# Design Token Change Report\n\n';
  out += `Baseline: \`${changeReport.baseline}\`\n\n`;
  out += '| Metric | Count |\n|---|---|\n';
  out += `| Baseline tokens | ${changeReport.summary.baselineCount} |\n`;
  out += `| Current tokens | ${changeReport.summary.currentCount} |\n`;
  out += `| Unchanged | ${changeReport.summary.unchanged} |\n`;
  out += `| 🚨 Removed (breaking) | **${removed.length}** |\n`;
  out += `| ⚠️ Modified | ${modified.length} |\n`;
  out += `| ✅ Added | ${added.length} |\n\n`;
  if (removed.length) {
    out +=
      '## 🚨 Breaking. Tokens removed or renamed\n\n> These will break any code still referencing them.\n\n';
    for (const r of removed) out += `- \`${r.name}\` *(${r.layer})*. Was \`${r.value}\`\n`;
    out += '\n';
  }
  if (modified.length) {
    out += '## ⚠️ Modified\n\n<details><summary>Show changed values</summary>\n\n';
    for (const m of modified)
      out += `- \`${m.name}\` *(${m.layer})*, \`${m.before}\` → \`${m.after}\`\n`;
    out += '\n</details>\n\n';
  }
  if (added.length) {
    out += '## ✅ Added\n\n<details><summary>Show new tokens</summary>\n\n';
    for (const a of added) out += `- \`${a.name}\` *(${a.layer})* = \`${a.value}\`\n`;
    out += '\n</details>\n\n';
  }
  out += '## Recommended action\n\n';
  if (removed.length)
    out +=
      '1. Document a replacement for each removed token above.\n2. Search `src/` for usages of the old names.\n3. Bump **MAJOR**.\n4. Run `npm run tokens:baseline` to lock this in. It writes the CHANGELOG.md entry automatically.\n';
  else if (modified.length)
    out +=
      '1. Spot-check the visual result of the changed values.\n2. Bump **PATCH**.\n3. Run `npm run tokens:baseline`. It writes the CHANGELOG.md entry automatically.\n';
  else if (added.length)
    out +=
      '1. Bump **MINOR**.\n2. Run `npm run tokens:baseline`. It writes the CHANGELOG.md entry automatically.\n';
  else out += 'No action needed, no changes detected.\n';
  return out;
}
fs.writeFileSync(
  path.join(PKG_DIR, 'reports/changes.json'),
  JSON.stringify(changeReport, null, 2) + '\n'
);
fs.writeFileSync(
  path.join(PKG_DIR, 'reports/changes.md'),
  `${formatChangesMarkdown().trimEnd()}\n`
);

// ---------------------------------------------------------------------------
// Step 11. `--pin`: lock in this build as the new baseline, write the CHANGELOG.md
// entry automatically (no one writes this by hand. See the header this function writes)
// ---------------------------------------------------------------------------

let pinResult = null;

function formatChangelogEntry({ removed, added, modified }, isInitial) {
  const date = new Date().toISOString().slice(0, 10);
  const bump = removed.length ? 'MAJOR' : modified.length ? 'PATCH' : 'MINOR';
  let out = `## ${date}${isInitial ? ', initial release' : ''}\n\n`;
  out += `Source: \`${path.basename(INPUT_PATH)}\`. `;
  out += `${added.length} added, ${removed.length} removed, ${modified.length} modified. Suggested bump: **${bump}**.\n\n`;
  if (removed.length) {
    out += '**Removed / renamed (breaking):**\n\n';
    for (const r of removed) out += `- \`${r.name}\` *(${r.layer})*. Was \`${r.value}\`\n`;
    out += '\n';
  }
  if (modified.length) {
    out += '**Modified:**\n\n';
    for (const m of modified)
      out += `- \`${m.name}\` *(${m.layer})*, \`${m.before}\` → \`${m.after}\`\n`;
    out += '\n';
  }
  if (added.length) {
    if (isInitial) {
      // The first pin adds everything at once, a wall of 1000+ lines isn't a useful
      // changelog entry, so summarize instead of listing every token.
      out += `**Added:** ${added.length} tokens across every layer (first release. See \`generated/tokens.json\` for the full list).\n\n`;
    } else {
      out += '**Added:**\n\n';
      for (const a of added) out += `- \`${a.name}\` *(${a.layer})* = \`${a.value}\`\n`;
      out += '\n';
    }
  }
  return out;
}

const CHANGELOG_HEADER = `# Design Tokens Changelog

Auto-generated by \`npm run tokens:baseline\` every time a token update is locked in. No
entry below was written by hand. See [README.md](./README.md) for how tokens flow through
this repo, and \`reports/changes.md\` for the live diff before you pin.

`;

function writeChangelogEntry(entry) {
  const changelogPath = path.join(PKG_DIR, 'CHANGELOG.md');
  const existing = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '';
  const previousEntries = existing.includes('\n## ')
    ? existing.slice(existing.indexOf('\n## ') + 1)
    : '';
  fs.writeFileSync(changelogPath, CHANGELOG_HEADER + entry + previousEntries);
}

if (pin) {
  const pinnedBaselinePath = path.join(PKG_DIR, 'generated/baseline.json');
  const hadPreviousBaseline = fs.existsSync(pinnedBaselinePath);
  const previousBaseline = hadPreviousBaseline
    ? JSON.parse(fs.readFileSync(pinnedBaselinePath, 'utf8'))
    : null;
  const pinDiff = diffSnapshots(flattenSnapshot(previousBaseline), currFlat);
  const hasChanges = pinDiff.removed.length || pinDiff.added.length || pinDiff.modified.length;

  if (!hadPreviousBaseline || hasChanges) {
    writeChangelogEntry(formatChangelogEntry(pinDiff, !hadPreviousBaseline));
    pinResult = { wrote: true, ...pinDiff };
  } else {
    pinResult = { wrote: false };
  }
  fs.mkdirSync(path.dirname(pinnedBaselinePath), { recursive: true });
  fs.copyFileSync(path.join(PKG_DIR, 'generated/tokens.json'), pinnedBaselinePath);
}

// ---------------------------------------------------------------------------
// Step 12, Console summary
// ---------------------------------------------------------------------------

const errors = issues.filter((i) => i.severity === 'error');
const warnings = issues.filter((i) => i.severity === 'warning');
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
};

console.log(`\n${c.bold}abc Design Tokens${c.reset}`);
console.log(`${c.gray}${'─'.repeat(60)}${c.reset}`);
console.log(`  Source:      ${path.relative(ROOT, INPUT_PATH)}`);
console.log(`  Primitives:  ${primitiveRecords.length + baseRecords.length} tokens`);
console.log(`  Semantic:    ${semanticRecords.length} tokens (${SEMANTIC_SET})`);
console.log(
  `  Breakpoints: ${BREAKPOINT_ORDER.filter((b) => bpRecords[b])
    .map((b) => `${b}=${bpRecords[b].length}`)
    .join(', ')}`
);
console.log(`  Typography:  ${typography.length} styles -> .text-* utilities`);
console.log(`  Shadows:     ${shadowPresets.length} composed presets`);
console.log(
  `  ${errors.length ? c.red : c.green}Issues:      ${errors.length} error(s), ${warnings.length} warning(s)${c.reset}, design-tokens/reports/issues.md`
);
console.log('');
console.log(`  Baseline:    ${changeReport.baseline}`);
console.log(
  `  ${c.red}Removed:     ${removed.length}${removed.length ? ' ⚠ BREAKING' : ''}${c.reset}`
);
console.log(`  ${c.yellow}Modified:    ${modified.length}${c.reset}`);
console.log(`  ${c.green}Added:       ${added.length}${c.reset}`);
console.log(`, design-tokens/reports/changes.md`);
if (semverSuggestion)
  console.log(`\n  ${c.bold}Suggested version bump: ${semverSuggestion}${c.reset}`);

if (pinResult) {
  if (pinResult.wrote) {
    console.log(
      `\n  ${c.green}Pinned.${c.reset} generated/baseline.json updated; CHANGELOG.md entry written automatically.`
    );
  } else {
    console.log(
      `\n  ${c.gray}Pinned, no token changes since the last pin, so CHANGELOG.md was left as-is.${c.reset}`
    );
  }
}

if (verbose || errors.length) {
  console.log('');
  for (const i of errors) console.error(`  ${c.red}ERROR${c.reset}   [${i.kind}] ${i.message}`);
}
if (verbose) {
  for (const i of warnings) console.warn(`  ${c.yellow}WARNING${c.reset} [${i.kind}] ${i.message}`);
}
console.log('');

// ---------------------------------------------------------------------------
// Exit code
// ---------------------------------------------------------------------------

if (strict && errors.length > 0) {
  console.error(`--strict: failing due to ${errors.length} error-level validation issue(s).\n`);
  process.exit(1);
}
if (failOnBreaking && removed.length > 0) {
  console.error(
    `--fail-on-breaking: ${removed.length} token(s) removed/renamed since baseline (${changeReport.baseline}).\n`
  );
  process.exit(1);
}
