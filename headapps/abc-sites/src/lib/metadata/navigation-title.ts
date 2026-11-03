import type { abcPageMetadataFields } from './metadata.types';

/**
 * Shorter page title for navigation and breadcrumb components: Navigation Title, falling back to Page Title.
 */
export function getNavigationTitle(fields?: abcPageMetadataFields | null, fallback = ''): string {
  const navigationTitle = fields?.NavigationTitle?.value?.trim();
  const pageTitle = fields?.PageTitle?.value?.trim();

  return navigationTitle || pageTitle || fallback;
}
