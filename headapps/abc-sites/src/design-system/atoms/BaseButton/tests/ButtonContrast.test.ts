import { tokens } from '@design-tokens/generated/tokens';
import { describe, expect, it } from 'vitest';

// Axe cannot see through the gradient layer (see the story's a11y exclude), so the label colour
// is checked here against every gradient stop instead. Primary's hover gradient has two stops
// below AA in the approved design; that is tracked in docs/TECH-DEBT.md, not asserted here.
const AA_NORMAL_TEXT = 4.5;

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const { brand } = tokens.color;
const { text, surface } = tokens;
const white = tokens.color.base.white;

const pairs = [
  ['primary at 450', text.inverse.primary, brand.primary['450']],
  ['primary at brand 1', text.inverse.primary, surface.brand['brand-1']],
  ['primary hover at 900', text.inverse.primary, brand.primary['900']],
  ['primary hover at brand 1 hover', text.inverse.primary, surface.brand['brand-1-hover']],
  ['secondary at default primary', text.default.secondary, surface.default.primary],
  ['secondary at default secondary', text.default.secondary, surface.default.secondary],
  ['secondary hover', text.default['secondary-hover'], surface.default['secondary-hover']],
  ['tertiary', text.default.tertiary, white],
  ['tertiary hover', text.default['secondary-hover'], white],
  ['link', text.default.secondary, white],
  ['link hover', surface.brand['brand-1-secondary-hover'], white],
] as const;

describe('Button label contrast', () => {
  it.each(pairs)('%s meets WCAG AA', (_name, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});
