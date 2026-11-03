import { describe, expect, it } from 'vitest';
import {
  getLogoAsset,
  getLogoDefinition,
  getLogosByCategory,
  isLogoName,
  isLogoSize,
  isLogoVariant,
  logoCounts,
  logoDefinitions,
  logoRegistry,
  resolveLogoName,
} from '../registry';

describe('abc logo registry', () => {
  it('contains the complete approved inventory with unique IDs', () => {
    expect(logoCounts).toEqual({ total: 7, abc: 3, partner: 4 });
    expect(logoDefinitions).toHaveLength(logoCounts.total);
    expect(logoRegistry.size).toBe(logoCounts.total);
  });

  it('returns logos by category', () => {
    expect(getLogosByCategory('abc')).toHaveLength(3);
    expect(getLogosByCategory('partner')).toHaveLength(4);
  });

  it('resolves only approved names', () => {
    expect(isLogoName('abc/wordmark')).toBe(true);
    expect(isLogoName('abc/not-approved')).toBe(false);
    expect(resolveLogoName('partner/sectigo')).toBe('partner/sectigo');
    expect(resolveLogoName('../logo')).toBe('abc/wordmark');
    expect(resolveLogoName('../logo', null)).toBeNull();
  });

  it('fails closed for invalid partner namespace values', () => {
    expect(resolveLogoName('partner/not-approved')).toBeNull();
    expect(resolveLogoName('partner/not-approved', 'abc/wordmark')).toBeNull();
  });

  it('preserves same-brand, missing, generic, and explicit fallback behavior', () => {
    expect(resolveLogoName('abc/not-approved')).toBe('abc/wordmark');
    expect(resolveLogoName(undefined)).toBe('abc/wordmark');
    expect(resolveLogoName('unknown')).toBe('abc/wordmark');
    expect(resolveLogoName('unknown', 'partner/sectigo')).toBe('partner/sectigo');
    expect(resolveLogoName('unknown', null)).toBeNull();
  });

  it('validates sizes and variants', () => {
    expect(isLogoSize('sm')).toBe(true);
    expect(isLogoSize('xl')).toBe(false);
    expect(isLogoVariant('badge')).toBe(true);
    expect(isLogoVariant('inverse')).toBe(false);
  });

  it('returns exact responsive source assets for the abc wordmark', () => {
    const definition = getLogoDefinition('abc/wordmark');
    expect(getLogoAsset(definition, 'sm', 'default')).toMatchObject({
      asset: { assetPath: '/logos/abc/wordmark/sm.svg', width: 119, height: 41 },
      variant: 'default',
    });
    expect(getLogoAsset(definition, 'lg', 'default')).toMatchObject({
      asset: { assetPath: '/logos/abc/wordmark/lg.svg', width: 166, height: 58 },
    });
  });

  it('falls back to default artwork for unsupported variants', () => {
    const definition = getLogoDefinition('abc/symbol');
    expect(getLogoAsset(definition, 'md', 'badge').variant).toBe('default');
  });

  it('rejects an invalid typed lookup at runtime', () => {
    // @ts-expect-error Intentionally bypass the compile-time allowlist to test runtime defense.
    expect(() => getLogoDefinition('partner/not-approved')).toThrow('Unknown abc logo');
  });
});
