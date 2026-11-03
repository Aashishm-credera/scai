import { describe, expect, it } from 'vitest';

import {
  asTree,
  cssVariableName,
  flattenLeaves,
  leafName,
  sortBySize,
  tokenEntries,
} from '../token-tree';

describe('asTree', () => {
  it('returns objects unchanged and everything else as an empty tree', () => {
    const tree = { a: 1 };
    expect(asTree(tree)).toBe(tree);
    expect(asTree(['a'])).toEqual({});
    expect(asTree('a')).toEqual({});
    expect(asTree(null)).toEqual({});
    expect(asTree(undefined)).toEqual({});
  });
});

describe('leafName', () => {
  it('takes the last dot segment', () => {
    expect(leafName('brand.brand-1-hover')).toBe('brand-1-hover');
    expect(leafName('md')).toBe('md');
  });
});

describe('cssVariableName', () => {
  it('unwraps a var() reference and passes literals through', () => {
    expect(cssVariableName('var(--abc-surface-brand-brand-1)')).toBe('--abc-surface-brand-brand-1');
    expect(cssVariableName('#cf222b')).toBe('#cf222b');
  });
});

describe('flattenLeaves', () => {
  it('walks nested groups into dot paths and stringifies numbers', () => {
    expect(flattenLeaves({ a: { b: 'x', c: 2 }, d: 'y' })).toEqual([
      { name: 'a.b', value: 'x' },
      { name: 'a.c', value: '2' },
      { name: 'd', value: 'y' },
    ]);
  });
});

describe('tokenEntries', () => {
  it('pairs each css variable with the literal at the same path', () => {
    const css = { brand: { 'brand-1': 'var(--abc-surface-brand-brand-1)' } };
    const values = { brand: { 'brand-1': '#cf222b' } };

    expect(tokenEntries(css, values)).toEqual([
      { name: 'brand.brand-1', variable: '--abc-surface-brand-brand-1', value: '#cf222b' },
    ]);
  });

  it('leaves the literal empty when the value tree has no match', () => {
    expect(tokenEntries({ gap: { md: 'var(--abc-spacing-gap-md)' } })).toEqual([
      { name: 'gap.md', variable: '--abc-spacing-gap-md', value: '' },
    ]);
  });
});

describe('sortBySize', () => {
  it('orders t-shirt sizes by scale rather than alphabetically', () => {
    const sorted = sortBySize([{ name: 'xl' }, { name: '2xs' }, { name: 'md' }, { name: 'none' }]);
    expect(sorted.map((entry) => entry.name)).toEqual(['none', '2xs', 'md', 'xl']);
  });

  it('falls back to a numeric-aware natural sort for unscaled names', () => {
    const sorted = sortBySize([{ name: 'shade.100' }, { name: 'shade.25' }, { name: 'shade.50' }]);
    expect(sorted.map((entry) => entry.name)).toEqual(['shade.25', 'shade.50', 'shade.100']);
  });

  it('does not mutate its input', () => {
    const input = [{ name: 'xl' }, { name: 'sm' }];
    sortBySize(input);
    expect(input.map((entry) => entry.name)).toEqual(['xl', 'sm']);
  });
});
