/**
 * Shared traversal for the generated token module. every Design page reads the same
 * two shapes: `cssVariables.*` (the `var(--abc-…)` reference a component should write) and
 * `tokens.*` (the literal sm-breakpoint value behind it), keyed by identical paths.
 */

export type TokenTree = Readonly<Record<string, unknown>>;

export type TokenEntry = {
  /** Dot path within the group, e.g. `brand.brand-1`. */
  name: string;
  /** What the entry resolves to, usually `var(--abc-…)`, already unwrapped by `cssVariableName`. */
  variable: string;
  /** Literal sm-breakpoint value from the runtime module, when the paths line up. */
  value: string;
};

const sizeOrder = [
  'none',
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
  '10xl',
  '11xl',
  '12xl',
  'pill',
];

export function asTree(value: unknown): TokenTree {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as TokenTree) : {};
}

export function leafName(path: string): string {
  return path.split('.').at(-1) ?? path;
}

export function cssVariableName(value: string): string {
  return value.match(/^var\((--[^)]+)\)$/)?.[1] ?? value;
}

export function flattenLeaves(tree: TokenTree, prefix = ''): { name: string; value: string }[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string' || typeof value === 'number') {
      return [{ name, value: String(value) }];
    }
    return flattenLeaves(asTree(value), name);
  });
}

function valueAt(tree: TokenTree, path: string): string {
  const leaf = path.split('.').reduce<unknown>((node, key) => asTree(node)[key], tree);
  return typeof leaf === 'string' || typeof leaf === 'number' ? String(leaf) : '';
}

/**
 * Zips a `cssVariables` subtree with the matching `tokens` subtree. A missing literal is
 * left empty rather than guessed. Responsive roles legitimately have none at this layer.
 */
export function tokenEntries(cssTree: unknown, valueTree: unknown = {}): TokenEntry[] {
  const values = asTree(valueTree);
  return flattenLeaves(asTree(cssTree)).map((entry) => ({
    name: entry.name,
    variable: cssVariableName(entry.value),
    value: valueAt(values, entry.name),
  }));
}

/** Orders t-shirt sizes the way a designer reads them; anything else falls back to natural sort. */
export function sortBySize<T extends { name: string }>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => {
    const aIndex = sizeOrder.indexOf(leafName(a.name));
    const bIndex = sizeOrder.indexOf(leafName(b.name));
    if (aIndex >= 0 || bIndex >= 0) {
      return (
        (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) -
        (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex)
      );
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
}
