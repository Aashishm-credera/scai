const SITECORE_GUID = /^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$/;

/**
 * Builds the `sc:item:{id}:{locale}:latest` cache tag for an item fetched outside `getPage`, matching the
 * format the Content SDK revalidate route handler emits for Experience Edge webhook item ids.
 * GraphQL returns ids without dashes, layout data with dashes, so ids are normalized to the dashed form.
 */
export function buildSitecoreItemCacheTag(itemId: string, locale: string): string {
  const compactId = itemId.trim().toLowerCase().replace(/[{}-]/g, '');
  const id = compactId.replace(SITECORE_GUID, '$1-$2-$3-$4-$5');
  const localeSegment = locale
    .trim()
    .toLowerCase()
    .replace(/[/:\s]+/g, '_');

  return `sc:item:${id}:${localeSegment}:latest`;
}
