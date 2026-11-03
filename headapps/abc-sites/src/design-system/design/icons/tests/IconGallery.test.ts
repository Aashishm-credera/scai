import { describe, expect, it } from 'vitest';
import {
  filterIcons,
  getDuplicateIconNames,
  getIconDisplayName,
  getIconGroupLabel,
  getIconGroups,
  getIconHierarchyLabel,
  sortIconIds,
  sortIconIdsByHierarchy,
  sortIcons,
} from '../stories/filter-icons';
import { iconDefinitions } from '../registry';

describe('icon gallery filtering', () => {
  it('filters by category', () => {
    expect(filterIcons(iconDefinitions, '', 'pictoral')).toHaveLength(102);
  });

  it('exposes the Figma subcategories and filters their icons', () => {
    expect(getIconGroups(iconDefinitions, 'miscellaneous')).toEqual([
      'flags',
      'payment',
      'integrations',
      'social',
    ]);
    expect(getIconGroups(iconDefinitions, 'pictoral')).toEqual(['strokes']);
    expect(getIconGroups(iconDefinitions, 'interface')).toEqual([
      'arrows',
      'charts',
      'communication',
      'users',
      'layout',
      'alerts-feedback',
      'shapes',
      'media-devices',
      'files',
      'images',
      'time',
      'education',
      'general',
      'finance-commerce',
      'maps-travel',
      'security',
      'editor',
    ]);
    expect(getIconGroupLabel('social')).toBe('Social');
    expect(getIconGroupLabel('strokes')).toBe('Strokes');
    expect(getIconGroupLabel('alerts-feedback')).toBe('Alerts & feedback');
    expect(getIconGroupLabel('finance-commerce')).toBe('Finance & eCommerce');
    expect(getIconGroupLabel('maps-travel')).toBe('Maps & travel');
    expect(getIconGroupLabel('security')).toBe('Security');
    expect(getIconGroupLabel('editor')).toBe('Editor');
    expect(filterIcons(iconDefinitions, '', 'miscellaneous', 'social')).toHaveLength(68);
    expect(filterIcons(iconDefinitions, 'gray', 'miscellaneous', 'social')).toHaveLength(34);
    expect(filterIcons(iconDefinitions, '', 'pictoral', 'strokes')).toHaveLength(51);
  });

  it('searches normalized names and canonical IDs', () => {
    const results = filterIcons(iconDefinitions, 'anatomical-heart', 'all');
    expect(results.some((icon) => icon.id === 'pictoral/anatomical-heart')).toBe(true);
  });

  it('returns no results for an unknown query', () => {
    expect(filterIcons(iconDefinitions, 'definitely-not-an-abc-icon', 'all')).toEqual([]);
  });

  it('uses the canonical registry path for duplicate leaf names', () => {
    const duplicateNames = getDuplicateIconNames(iconDefinitions);
    const pictoralApple = iconDefinitions.find((icon) => icon.id === 'pictoral/apple');
    const integrationApple = iconDefinitions.find(
      (icon) => icon.id === 'miscellaneous/integrations/apple'
    );

    expect(duplicateNames.has('apple')).toBe(true);
    expect(pictoralApple).toBeDefined();
    expect(integrationApple).toBeDefined();
    expect(getIconDisplayName(pictoralApple!, duplicateNames)).toBe('pictoral/apple');
    expect(getIconDisplayName(integrationApple!, duplicateNames)).toBe(
      'miscellaneous/integrations/apple'
    );
  });

  it('sorts Gallery results alphabetically by name and then canonical ID', () => {
    const selected = [
      'interface/general/search-md',
      'pictoral/play',
      'interface/general/search-lg',
      'interface/media-devices/play',
    ].map((id) => iconDefinitions.find((icon) => icon.id === id)!);

    expect(sortIcons(selected).map((icon) => icon.id)).toEqual([
      'interface/media-devices/play',
      'pictoral/play',
      'interface/general/search-lg',
      'interface/general/search-md',
    ]);
  });

  it('sorts Playground name values alphabetically by canonical ID', () => {
    const selected = [
      'pictoral/search',
      'interface/general/search-lg',
      'interface/general/search-md',
    ].map((id) => iconDefinitions.find((icon) => icon.id === id)!);

    expect(sortIconIds(selected)).toEqual([
      'interface/general/search-lg',
      'interface/general/search-md',
      'pictoral/search',
    ]);
  });

  it('labels and sorts Playground values by category and subcategory', () => {
    const selected = [
      'interface/arrows/arrow-left',
      'pictoral/cpr',
      'miscellaneous/social/facebook',
      'interface/general/heart',
    ].map((id) => iconDefinitions.find((icon) => icon.id === id)!);

    expect(selected.map(getIconHierarchyLabel)).toEqual([
      'Interface / Arrows / arrow-left',
      'Pictoral / cpr',
      'Miscellaneous / Social / facebook',
      'Interface / General / heart',
    ]);
    expect(sortIconIdsByHierarchy(selected)).toEqual([
      'interface/arrows/arrow-left',
      'interface/general/heart',
      'miscellaneous/social/facebook',
      'pictoral/cpr',
    ]);
  });
});
