import { describe, expect, it } from 'vitest';
import { filterLogos } from '../stories/filter-logos';
import { logoDefinitions } from '../registry';

describe('logo gallery filtering', () => {
  it('filters by category', () => {
    expect(filterLogos(logoDefinitions, '', 'partner')).toHaveLength(4);
  });

  it('searches labels, IDs, and source names', () => {
    expect(filterLogos(logoDefinitions, 'American Heart', 'all')).toHaveLength(3);
    expect(filterLogos(logoDefinitions, 'charity-navigator', 'all')[0]?.id).toBe(
      'partner/charity-navigator'
    );
    expect(filterLogos(logoDefinitions, 'Company=Sectigo', 'all')[0]?.id).toBe('partner/sectigo');
  });

  it('returns no results for an unknown query', () => {
    expect(filterLogos(logoDefinitions, 'not-an-approved-logo', 'all')).toEqual([]);
  });
});
