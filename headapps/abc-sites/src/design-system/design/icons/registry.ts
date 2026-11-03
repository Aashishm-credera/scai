import { iconData } from './icon-data.generated';
import { isIconAssetAvailable } from './availability';
import type { IconCategory, IconColorMode, IconDefinition, IconName } from './types';

type GeneratedIconRow = readonly [
  id: IconName,
  name: string,
  category: IconCategory,
  group: string,
  sourceCategory: IconDefinition['sourceCategory'],
  assetPath: IconDefinition['assetPath'],
  width: number,
  height: number,
  colorMode: IconColorMode,
];

export const iconDefinitions: readonly IconDefinition[] = (
  iconData as readonly GeneratedIconRow[]
).map(([id, name, category, group, sourceCategory, assetPath, width, height, colorMode]) => ({
  id,
  name,
  category,
  group,
  sourceCategory,
  assetPath,
  width,
  height,
  colorMode,
}));

export const iconCounts = {
  total: iconDefinitions.length,
  miscellaneous: iconDefinitions.filter((icon) => icon.category === 'miscellaneous').length,
  pictoral: iconDefinitions.filter((icon) => icon.category === 'pictoral').length,
  interface: iconDefinitions.filter((icon) => icon.category === 'interface').length,
} as const;

export const iconRegistry = new Map<IconName, IconDefinition>(
  iconDefinitions.map((icon) => [icon.id, icon])
);

/**
 * Temporary compatibility map for Interface IDs stored before subcategories were added.
 * The pinned count in registry.test.ts prevents future icons from gaining legacy aliases
 * accidentally. Remove this map after the XM Cloud content migration described in docs/ICONS.md.
 */
const legacyInterfaceAliasCandidates = new Map<string, IconName[]>();
for (const icon of iconDefinitions) {
  if (icon.category !== 'interface') continue;
  const legacyName = `interface/${icon.name}`;
  legacyInterfaceAliasCandidates.set(legacyName, [
    ...(legacyInterfaceAliasCandidates.get(legacyName) ?? []),
    icon.id,
  ]);
}

export const legacyInterfaceIconAliases: ReadonlyMap<string, IconName> = new Map(
  [...legacyInterfaceAliasCandidates].flatMap(([legacyName, candidates]) =>
    candidates.length === 1 ? [[legacyName, candidates[0]] as const] : []
  )
);

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && iconRegistry.has(value as IconName);
}

export function getIconDefinition(name: IconName): IconDefinition {
  const definition = iconRegistry.get(name);
  if (!definition) throw new Error(`Unknown abc icon: ${name}`);
  return definition;
}

export function getIconsByCategory(category: IconCategory): readonly IconDefinition[] {
  return iconDefinitions.filter((icon) => icon.category === category);
}

/**
 * Resolves untrusted CMS input against the Figma-approved allowlist.
 * No input is ever treated as SVG markup or interpolated into a file path.
 */
export function resolveIconName(
  value: unknown,
  fallback: IconName | null = 'interface/general/placeholder'
): IconName | null {
  if (isIconName(value) && isIconAssetAvailable(value)) return value;
  if (typeof value === 'string') {
    const alias = legacyInterfaceIconAliases.get(value);
    if (alias && isIconAssetAvailable(alias)) return alias;
  }
  return fallback && isIconName(fallback) && isIconAssetAvailable(fallback) ? fallback : null;
}
