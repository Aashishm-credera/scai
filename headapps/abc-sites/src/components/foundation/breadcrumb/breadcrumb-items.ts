import type { BreadcrumbItem } from '@/design-system/atoms/BaseBreadcrumb';

/** One page from a breadcrumb GraphQL query: the context item or one of its `ancestors`. */
export interface BreadcrumbPage {
  id: string;
  name: string;
  PageTitle?: { value?: string } | null;
  NavigationTitle?: { value?: string } | null;
  url?: { path?: string } | null;
  IsExcludedFromBreadcrumb?: { value?: boolean } | null;
}

/**
 * GraphQL returns `ancestors` nearest first; the trail reads from Home down. Pages that opt out
 * through Exclude From Breadcrumb are skipped, and the label falls back from Navigation Title to
 * Page Title to the item name.
 */
export const toBreadcrumbItems = (
  ancestors: ReadonlyArray<BreadcrumbPage> | null | undefined,
  language: string | undefined
): BreadcrumbItem[] =>
  [...(ancestors ?? [])]
    .reverse()
    .filter((page) => !page.IsExcludedFromBreadcrumb?.value)
    .map((page) => {
      const path = page.url?.path ?? '/';

      return {
        title: page.NavigationTitle?.value || page.PageTitle?.value || page.name,
        url: `/${language}${path === '/' ? '/' : path.replace(/\/+$/, '')}`,
      };
    });
