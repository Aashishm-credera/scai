import { describe, expect, it } from 'vitest';
import {
  getIconDefinition,
  getIconsByCategory,
  iconCounts,
  iconDefinitions,
  iconRegistry,
  isIconName,
  legacyInterfaceIconAliases,
  resolveIconName,
} from '../registry';
import { isIconAssetAvailable } from '../availability';

describe('abc icon registry', () => {
  it('contains the complete Figma inventory with unique allowlisted IDs', () => {
    expect(iconCounts).toMatchObject({
      total: 1848,
      miscellaneous: 573,
      pictoral: 102,
      interface: 1173,
    });
    expect(iconDefinitions).toHaveLength(iconCounts.total);
    expect(iconRegistry.size).toBe(iconCounts.total);
  });

  it('derives category counts from the authoritative icon definitions', () => {
    expect(iconCounts).toEqual({
      total: iconDefinitions.length,
      miscellaneous: iconDefinitions.filter((icon) => icon.category === 'miscellaneous').length,
      pictoral: iconDefinitions.filter((icon) => icon.category === 'pictoral').length,
      interface: iconDefinitions.filter((icon) => icon.category === 'interface').length,
    });
  });

  it.each([
    ['miscellaneous', 573],
    ['pictoral', 102],
    ['interface', 1173],
  ] as const)('returns the %s category', (category, count) => {
    const icons = getIconsByCategory(category);
    expect(icons).toHaveLength(count);
    expect(icons.every((icon) => icon.category === category)).toBe(true);
  });

  it('resolves only approved icon names', () => {
    expect(isIconName('interface/general/heart')).toBe(true);
    expect(isIconName('interface/not-approved')).toBe(false);
    expect(resolveIconName('interface/general/heart')).toBe('interface/general/heart');
  });

  it('uses a safe fallback for unknown and malicious CMS values', () => {
    expect(resolveIconName('unknown')).toBe('interface/general/placeholder');
    expect(resolveIconName('<svg onload="alert(1)">')).toBe('interface/general/placeholder');
    expect(resolveIconName('../../secret', null)).toBeNull();
  });

  it('resolves every unambiguous legacy Interface ID to its canonical subcategory ID', () => {
    expect(legacyInterfaceIconAliases.size).toBe(1173);

    for (const [legacyName, canonicalName] of legacyInterfaceIconAliases) {
      expect(legacyName).toBe(`interface/${getIconDefinition(canonicalName).name}`);
      expect(resolveIconName(legacyName, null)).toBe(canonicalName);
    }
  });

  it('uses the safe fallback for a quarantined Figma export', () => {
    expect(isIconAssetAvailable('miscellaneous/integrations/igtv')).toBe(false);
    expect(resolveIconName('miscellaneous/integrations/igtv')).toBe(
      'interface/general/placeholder'
    );
  });

  it('returns traceable Figma metadata for a valid icon', () => {
    expect(getIconDefinition('interface/general/heart')).toMatchObject({
      category: 'interface',
      group: 'general',
      sourceCategory: 'Icon - Interface',
      assetPath: '/icons/interface/heart.svg',
    });
    expect(getIconDefinition('miscellaneous/social/facebook').group).toBe('social');
    expect(getIconDefinition('miscellaneous/social/facebook-gray')).toMatchObject({
      name: 'facebook-gray',
      group: 'social',
      assetPath: '/icons/miscellaneous/social/facebook-gray.svg',
      colorMode: 'multicolor',
    });
  });

  it('preserves the distinct monochrome Pictoral stroke variants', () => {
    expect(isIconName('pictoral/search')).toBe(true);
    expect(getIconDefinition('pictoral/search')).toMatchObject({
      group: 'strokes',
      colorMode: 'monochrome',
      assetPath: '/icons/pictoral/search.svg',
    });
    expect(iconDefinitions.filter((icon) => icon.id.startsWith('pictoral/'))).toHaveLength(51);
  });

  it.each([
    ['interface/arrows/arrow-left', 'arrows'],
    ['interface/charts/bar-chart-01', 'charts'],
    ['interface/communication/message-chat-circle', 'communication'],
    ['interface/users/user-01', 'users'],
    ['interface/layout/layout-top', 'layout'],
    ['interface/alerts-feedback/alert-circle', 'alerts-feedback'],
    ['interface/shapes/cube-01', 'shapes'],
    ['interface/media-devices/airplay', 'media-devices'],
    ['interface/files/folder', 'files'],
    ['interface/images/camera-01', 'images'],
    ['interface/time/calendar', 'time'],
    ['interface/education/atom-01', 'education'],
    ['interface/general/heart', 'general'],
    ['interface/finance-commerce/credit-card-01', 'finance-commerce'],
    ['interface/maps-travel/compass-01', 'maps-travel'],
    ['interface/education/compass', 'education'],
    ['interface/security/file-lock-01', 'security'],
    ['interface/security/folder-shield', 'security'],
    ['interface/editor/align-center', 'editor'],
    ['interface/editor/attachment-01', 'editor'],
    ['interface/editor/scale-01', 'editor'],
    ['interface/finance-commerce/scales-01', 'finance-commerce'],
  ] as const)('assigns %s to the %s Figma group', (name, group) => {
    expect(getIconDefinition(name).group).toBe(group);
  });

  it('assigns every Interface icon to one Figma group', () => {
    const interfaceIcons = getIconsByCategory('interface');
    expect(interfaceIcons.every((icon) => icon.group.length > 0)).toBe(true);
  });

  it('rejects an invalid typed lookup at runtime', () => {
    // @ts-expect-error Intentionally bypass the compile-time allowlist to verify runtime defense.
    expect(() => getIconDefinition('interface/not-approved')).toThrow('Unknown abc icon');
  });
});
