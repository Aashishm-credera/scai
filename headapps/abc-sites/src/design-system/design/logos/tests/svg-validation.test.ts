import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { logoDefinitions } from '../registry';
import type { LogoAsset } from '../types';

const dangerousMarkup =
  /<\s*(script|foreignObject|iframe|object|embed)\b|\bon[a-z]+\s*=|(?:href|xlink:href)\s*=\s*["']\s*(?:javascript:|https?:|\/\/)/i;

const assets = Array.from(
  new Map(
    logoDefinitions.flatMap((logo) =>
      Object.values(logo.assets).flatMap((sizes) =>
        Object.values(sizes ?? {}).map((asset) => [asset.assetPath, asset] as const)
      )
    )
  ).values()
) as LogoAsset[];

describe('approved logo SVG assets', () => {
  it('has a local SVG for every registry asset', () => {
    expect(
      assets.filter(
        (asset) => !existsSync(resolve(process.cwd(), 'public', asset.assetPath.slice(1)))
      )
    ).toEqual([]);
  });

  it('uses unique allowlisted asset paths', () => {
    const paths = assets.map((asset) => asset.assetPath);
    expect(new Set(paths).size).toBe(paths.length);
    expect(
      paths.every((path) =>
        /^\/logos\/(?:abc\/[a-z0-9/-]+|partner\/[a-z0-9-]+\/(?:default|badge))\.svg$/.test(path)
      )
    ).toBe(true);
  });

  it.each(assets.map((asset) => [asset.assetPath] as const))(
    '%s is present and contains no executable or remote markup',
    (assetPath) => {
      const svg = readFileSync(resolve(process.cwd(), 'public', assetPath.slice(1)), 'utf8');
      expect(svg).toMatch(/^<svg\b/);
      expect(svg).toMatch(/\bviewBox=["'][^"']+["']/);
      expect(svg).not.toMatch(dangerousMarkup);
      expect(svg).not.toMatch(/<\?xml|<!--|<metadata\b/i);
      for (const [, href] of svg.matchAll(/(?:href|xlink:href)=["']([^"']+)["']/gi)) {
        expect(href.startsWith('#') || /^data:image\/(?:png|jpeg);base64,/.test(href)).toBe(true);
      }
    }
  );
});
