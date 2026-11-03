/**
 * Design-token pipeline policy.
 *
 * Keep human decisions here; token values belong in figma-export.json. This is intentionally
 * a small surface so the design-system team can update the schema/naming contract without
 * changing the validator or generators.
 */

export const TOKEN_SOURCE = 'design-tokens/figma-export.json';

export const REQUIRED_TOKEN_SETS = [
  '_Primitive/Value',
  'Color/Light',
  'Base/Base',
  'Breakpoint/sm',
  'Breakpoint/md',
  'Breakpoint/lg',
  'Breakpoint/xl',
];

// These are NOT the Figma frame widths (sm=390, md=768, lg=1280, xl=1600, where a mode was
// designed). They're the client's device-breakpoint mapping (S < 480, M >= 480, L >= 1024,
// XL >= 1600). The width a mode's styles actually start applying at, confirmed with the
// design-system team on #236853. Re-check these if that mapping ever changes; the export
// itself doesn't carry them.
export const BREAKPOINTS = {
  sm: { px: 0, isBase: true },
  md: { px: 480, isBase: false },
  lg: { px: 1024, isBase: false },
  xl: { px: 1600, isBase: false },
};

export const BREAKPOINT_ORDER = ['sm', 'md', 'lg', 'xl'];

/** Reserved extension points for an approved future path-derived naming rule. Empty today so
 * all existing generated token names remain backward compatible. */
export const PATH_DERIVED_NAME_PREFIXES = [];
export const ROOT_NAME_OVERRIDES = {};

/**
 * Compatibility exceptions already present in the #236853 export. The generator preserves
 * its established deterministic fallbacks for only these exact collisions. New collisions
 * fail validation. Remove entries after Figma assigns unique Web codeSyntax names.
 */
export const KNOWN_CODE_SYNTAX_COLLISIONS = {
  primitives: {
    // `font.size.N` is the real px scale (N is the size) and carries an explicit Figma
    // codeSyntax, so it keeps the clean name. `fontSize.N` is a legacy index-based list where
    // N is a position, not a size. FontSize.12 is 72px, fontSize.13 is 30px, and it has no
    // codeSyntax, so the generator derives the same name from its path. The loser takes a
    // numbered suffix (`--abc-font-size-12-2`). Adding an entry here is what keeps
    // `--abc-font-size-13` meaning 13px, which semantic.css relies on for label-sm.
    '--abc-font-size-12': ['font.size.12', 'fontSize.12'],
    '--abc-font-size-13': ['font.size.13', 'fontSize.13'],
    '--abc-font-size-14': ['font.size.14', 'fontSize.14'],
  },
  'Color/Light': {
    '--abc-text-brand-secondary': ['text.brand.brand-2-primary', 'text.brand.brand-2-secondary'],
    '--abc-text-brand-primary': ['text.brand.brand-1-primary', 'text.brand.brand-1-secondary'],
    '--abc-surface-brand-primary': [
      'surface.brand.brand-1',
      'surface.brand.brand-1-secondary',
      'surface.brand.brand-1-hover',
      'surface.brand.brand-1-secondary-hover',
    ],
    '--abc-surface-brand-secondary': ['surface.brand.brand-2', 'surface.brand.brand-2-hover'],
  },
  'Breakpoint/*': {
    '--abc-spacing-gap-4xl': ['spacing.gap.4xl', 'spacing.gap.5xl'],
    '--abc-spacing-gap-lg': ['spacing.gap.xl', 'spacing.gap.lg'],
  },
};

// These are retained in the source for Figma fidelity but are not standalone CSS/runtime
// tokens. Shadows and typography are composed from their parts by generate.mjs.
export const SKIP_PRIMITIVE_GROUPS = ['Bodies'];
export const TYPOGRAPHY_PREVIEW_GROUPS = ['Display', 'Heading', 'Body', 'Lead', 'Label'];
export const NON_EMITTED_PRIMITIVE_GROUPS = new Set([
  ...SKIP_PRIMITIVE_GROUPS,
  ...TYPOGRAPHY_PREVIEW_GROUPS,
]);

// DTCG types plus the legacy Tokens Studio types present in the #236853 export.
/**
 * Tokens whose Figma `$type` has no CSS equivalent, keyed `<set>::<token path>`.
 *
 * Figma exports anything it cannot map to a standard DTCG type as `$type: "other"`. Today that
 * is `transition/D/easing`, a CUSTOM_SPRING with a bounce of 0.2. CSS has no spring easing, so
 * the pipeline refuses to invent a curve the design system never chose, exactly as it refuses to
 * invent the missing `heading/2xl` font-size.
 *
 * This is an exact-path allowlist rather than enabling `other` wholesale, so a genuinely
 * malformed token still fails validation. Remove an entry once Figma re-authors that variable as
 * a `cubicBezier`. See docs/TECH-DEBT.md.
 */
export const UNREPRESENTABLE_TOKENS = new Set([
  'Motion/Full::transition.D.easing',
  'Motion/Reduced::transition.D.easing',
]);

export const SUPPORTED_TOKEN_TYPES = new Set([
  'boolean',
  'border',
  'color',
  'cubicBezier',
  'dimension',
  'duration',
  'fontFamily',
  'fontWeight',
  'gradient',
  'number',
  'shadow',
  'strokeStyle',
  'string',
  'transition',
  'typography',
  // Legacy types emitted by the current Figma/Tokens Studio export.
  'blur',
  'fontFamilies',
  'fontSizes',
  'fontWeights',
  'letterSpacing',
  'lineHeights',
  'paragraphIndent',
  'paragraphSpacing',
  'spread',
  'text',
  'textCase',
  'textDecoration',
  'type',
  'x',
  'y',
]);
