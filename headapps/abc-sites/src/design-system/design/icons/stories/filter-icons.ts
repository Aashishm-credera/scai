import type { IconCategory, IconDefinition, IconName } from '../types';
import { iconCategoryLabels, iconGroupLabels, iconGroupOrder } from './taxonomy';

/**
 * Finds leaf names that occur in more than one approved registry path.
 * The full path is the canonical Sitecore value, so it is used to
 * disambiguate these entries in the Gallery.
 */
export function getDuplicateIconNames(icons: readonly IconDefinition[]): ReadonlySet<string> {
  const counts = new Map<string, number>();

  for (const icon of icons) {
    counts.set(icon.name, (counts.get(icon.name) ?? 0) + 1);
  }

  return new Set([...counts].flatMap(([name, count]) => (count > 1 ? [name] : [])));
}

export function getIconDisplayName(
  icon: IconDefinition,
  duplicateNames: ReadonlySet<string>
): string {
  return duplicateNames.has(icon.name) ? icon.id : icon.name;
}

/** Sorts Gallery results by visible icon name, then by canonical ID for ties. */
export function sortIcons(icons: readonly IconDefinition[]): IconDefinition[] {
  return [...icons].sort(
    (left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)
  );
}

/** Sorts canonical values for Storybook's icon-name select control. */
export function sortIconIds(icons: readonly IconDefinition[]): IconName[] {
  return icons.map((icon) => icon.id).sort((left, right) => left.localeCompare(right));
}

/** Returns the Figma subcategories available within an icon category. */
export function getIconGroups(icons: readonly IconDefinition[], category: IconCategory): string[] {
  const order = new Map(iconGroupOrder[category].map((group, index) => [group, index]));
  return [
    ...new Set(
      icons
        .filter((icon) => icon.category === category)
        .map((icon) => icon.group)
        .filter(Boolean)
    ),
  ].sort(
    (left, right) =>
      (order.get(left) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(right) ?? Number.MAX_SAFE_INTEGER) || left.localeCompare(right)
  );
}

/** Converts a Figma group key into its Gallery label. */
export function getIconGroupLabel(group: string): string {
  if (iconGroupLabels[group]) return iconGroupLabels[group];
  return group.replace(
    /(^|[-_])(\w)/g,
    (_, separator: string, letter: string) =>
      `${separator === '-' || separator === '_' ? ' ' : ''}${letter.toUpperCase()}`
  );
}

/** User-facing label for Storybook controls without changing the canonical icon ID. */
export function getIconHierarchyLabel(icon: IconDefinition): string {
  return [
    iconCategoryLabels[icon.category],
    icon.group ? getIconGroupLabel(icon.group) : null,
    icon.name,
  ]
    .filter(Boolean)
    .join(' / ');
}

/** Sorts Playground options by their displayed category/subcategory hierarchy. */
export function sortIconIdsByHierarchy(icons: readonly IconDefinition[]): IconName[] {
  return [...icons]
    .sort(
      (left, right) =>
        getIconHierarchyLabel(left).localeCompare(getIconHierarchyLabel(right)) ||
        left.id.localeCompare(right.id)
    )
    .map((icon) => icon.id);
}

export function filterIcons(
  icons: readonly IconDefinition[],
  query: string,
  category: IconCategory | 'all',
  group: string | 'all' = 'all'
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return icons.filter(
    (icon) =>
      (category === 'all' || icon.category === category) &&
      (group === 'all' || icon.group === group) &&
      (!normalizedQuery ||
        icon.name.toLocaleLowerCase().includes(normalizedQuery) ||
        icon.id.toLocaleLowerCase().includes(normalizedQuery) ||
        icon.group.toLocaleLowerCase().includes(normalizedQuery))
  );
}
