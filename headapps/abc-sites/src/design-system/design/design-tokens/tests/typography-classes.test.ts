import { tokens } from '@design-tokens/generated/tokens';
import { describe, expect, it } from 'vitest';

import { typographyClass, typographyClasses } from '../typography-classes';

const tokenPairs = Object.entries(tokens.typography).flatMap(([role, sizes]) =>
  Object.keys(sizes).map((size) => `${role}.${size}`)
);

const mapPairs = Object.entries(typographyClasses).flatMap(([role, sizes]) =>
  Object.keys(sizes).map((size) => `${role}.${size}`)
);

describe('typographyClasses', () => {
  it('covers exactly the roles and sizes the token pipeline generates', () => {
    expect(mapPairs.sort()).toEqual(tokenPairs.sort());
  });

  it('spells every class out in full so Tailwind emits the @utility rule', () => {
    for (const pair of mapPairs) {
      const [role, size] = pair.split('.');
      expect(typographyClass(role, size)).toBe(`text-${role}-${size}`);
    }
  });

  it('returns undefined for a role or size that does not exist', () => {
    expect(typographyClass('display', '9xl')).toBeUndefined();
    expect(typographyClass('caption', 'md')).toBeUndefined();
  });
});
