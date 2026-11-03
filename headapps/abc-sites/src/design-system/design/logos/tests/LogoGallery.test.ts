import { describe, expect, it } from 'vitest';
import { sortLogoIds, sortLogos } from '../stories/filter-logos';
import { logoDefinitions } from '../registry';

describe('logo gallery sorting', () => {
  it('sorts by displayed label and then canonical ID', () => {
    const selected = [
      'partner/sectigo',
      'abc/wordmark',
      'partner/charity-navigator',
      'abc/logomark',
    ].map((id) => logoDefinitions.find((logo) => logo.id === id)!);

    expect(sortLogos(selected).map((logo) => logo.id)).toEqual([
      'abc/logomark',
      'abc/wordmark',
      'partner/charity-navigator',
      'partner/sectigo',
    ]);
  });

  it('sorts Playground name values alphabetically by canonical ID', () => {
    const selected = ['partner/sectigo', 'abc/wordmark', 'abc/logomark'].map((id) =>
      logoDefinitions.find((logo) => logo.id === id)!
    );

    expect(sortLogoIds(selected)).toEqual(['abc/logomark', 'abc/wordmark', 'partner/sectigo']);
  });
});
