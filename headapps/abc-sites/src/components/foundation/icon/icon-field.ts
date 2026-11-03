import type { Item } from '@sitecore-content-sdk/nextjs';

/**
 * Helpers that turn a Sitecore Icon item reference into what the design-system icon registry
 * expects. Shared so every component with an Icon field resolves it the same way.
 */

const ICONS_ROOT = '/icons/';

/**
 * Icon items carry no fields: their path below the site's Icons folder mirrors the registry name,
 * e.g. `/Icons/Interface/Arrows/arrow-right` is `interface/arrows/arrow-right`. Folder names are
 * authored in title case, so the path is lower-cased and spaces become hyphens. Anything outside
 * that folder, including empty, means no icon.
 */
export const getIconName = (icon: Partial<Item> | null | undefined): string | undefined => {
  const url = icon?.url;
  if (typeof url !== 'string' || !url.trim()) return undefined;

  const path = url.split(/[?#]/, 1)[0].toLowerCase();
  const rootIndex = path.indexOf(ICONS_ROOT);
  if (rootIndex === -1) return undefined;

  const iconName = path
    .slice(rootIndex + ICONS_ROOT.length)
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.svg$/, '')
    .replace(/%20|\s+/g, '-');

  return iconName || undefined;
};
