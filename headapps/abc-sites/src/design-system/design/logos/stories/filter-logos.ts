import type { LogoCategory, LogoDefinition, LogoName } from '../types';

/** Sorts Gallery results by displayed label, then canonical ID for ties. */
export function sortLogos(logos: readonly LogoDefinition[]): LogoDefinition[] {
  return [...logos].sort(
    (left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id)
  );
}

/** Sorts canonical values for Storybook's logo-name select control. */
export function sortLogoIds(logos: readonly LogoDefinition[]): LogoName[] {
  return logos.map((logo) => logo.id).sort((left, right) => left.localeCompare(right));
}

export function filterLogos(
  logos: readonly LogoDefinition[],
  query: string,
  category: LogoCategory | 'all'
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return logos.filter(
    (logo) =>
      (category === 'all' || logo.category === category) &&
      (!normalizedQuery ||
        logo.label.toLocaleLowerCase().includes(normalizedQuery) ||
        logo.id.toLocaleLowerCase().includes(normalizedQuery) ||
        logo.sourceName.toLocaleLowerCase().includes(normalizedQuery))
  );
}
