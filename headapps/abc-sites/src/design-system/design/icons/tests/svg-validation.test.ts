import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { iconAssetExceptions } from '../availability';
import { iconDefinitions } from '../registry';

const dangerousMarkup =
  /<\s*(script|foreignObject|iframe|object|embed)\b|\bon[a-z]+\s*=|(?:href|xlink:href)\s*=\s*["']\s*(?:javascript:|https?:|\/\/)/i;

describe('approved Figma SVG assets', () => {
  const withAssetState = iconDefinitions.map((icon) => ({
    ...icon,
    exists: existsSync(resolve(process.cwd(), 'public', icon.assetPath.slice(1))),
  }));
  const availableIcons = withAssetState.filter((icon) => icon.exists);
  const missingIcons = withAssetState.filter((icon) => !icon.exists);

  it('has a local SVG for every approved registry entry except documented quarantines', () => {
    expect(missingIcons.map((icon) => icon.id).sort()).toEqual(
      Object.keys(iconAssetExceptions).sort()
    );
  });

  it('documents only approved registry entries as quarantined', () => {
    const approvedIds = new Set<string>(iconDefinitions.map((icon) => icon.id));
    expect(Object.keys(iconAssetExceptions).every((id) => approvedIds.has(id))).toBe(true);
  });

  it('uses unique kebab-case asset paths', () => {
    const paths = iconDefinitions.map((icon) => icon.assetPath);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((path) => /^\/icons\/[a-z0-9/-]+\.svg$/.test(path))).toBe(true);
  });

  it('keeps every Pictoral stroke variant distinct from its same-named full-color asset', () => {
    const strokeIcons = availableIcons.filter((icon) => icon.group === 'strokes');
    expect(strokeIcons).toHaveLength(51);

    for (const strokeIcon of strokeIcons) {
      const fullColorIcon = availableIcons.find(
        (icon) => icon.id === `pictoral/${strokeIcon.name}`
      );
      expect(fullColorIcon, `missing full-color counterpart for ${strokeIcon.id}`).toBeDefined();
      expect(strokeIcon.colorMode).toBe('monochrome');
      expect(fullColorIcon?.colorMode).toBe('multicolor');

      const strokeSvg = readFileSync(
        resolve(process.cwd(), 'public', strokeIcon.assetPath.slice(1)),
        'utf8'
      );
      const fullColorSvg = readFileSync(
        resolve(process.cwd(), 'public', fullColorIcon!.assetPath.slice(1)),
        'utf8'
      );
      expect(strokeSvg).not.toBe(fullColorSvg);
    }
  });

  it.each(availableIcons.map((icon) => [icon.id, icon.assetPath, icon.colorMode] as const))(
    '%s is present, valid, and sanitized',
    (_id, assetPath, colorMode) => {
      const svg = readFileSync(resolve(process.cwd(), 'public', assetPath.slice(1)), 'utf8');
      expect(svg).toMatch(/^<svg\b/);
      expect(svg).toMatch(/\bviewBox=["'][^"']+["']/);
      expect(svg).not.toMatch(dangerousMarkup);
      expect(svg).not.toMatch(/<\?xml|<!--|<metadata\b/i);
      if (colorMode === 'monochrome') expect(svg).toContain('currentColor');
    }
  );
});
