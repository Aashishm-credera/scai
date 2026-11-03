import { Fragment } from 'react';

import { abcIcon } from '@/design-system/design/icons';
import { cn } from '@/design-system/lib/cn';
import { BreadcrumbOverflow, type BreadcrumbOverflowItem } from './BreadcrumbOverflow';
import { BreadcrumbLabel } from './BreadcrumbLabel';
import type {
  BaseBreadcrumbProps,
  BreadcrumbTrailProps,
  BreadcrumbView,
  IndexedBreadcrumbItem,
} from './base-breadcrumb.props';

export type { BaseBreadcrumbProps, BreadcrumbItem } from './base-breadcrumb.props';

function createView(items: IndexedBreadcrumbItem[], visibleLimit: number): BreadcrumbView {
  if (items.length <= visibleLimit) return { visibleItems: items, hiddenItems: [] };

  const leadingCount = visibleLimit - 1;
  return {
    visibleItems: [...items.slice(0, leadingCount), items[items.length - 1]],
    hiddenItems: items.slice(leadingCount, -1),
  };
}

function toDropdownItems(items: IndexedBreadcrumbItem[]): BreadcrumbOverflowItem[] {
  return items.flatMap(({ index, item }) =>
    item.url ? [{ id: `${index}-${item.url}`, label: item.title ?? item.url, href: item.url }] : []
  );
}

function BreadcrumbSeparator() {
  return (
    <li
      aria-hidden="true"
      data-breadcrumb-separator=""
      className="breadcrumb-separator pointer-events-none flex flex-none items-center text-(--abc-foreground-default-quaternary)"
    >
      <abcIcon name="interface/arrows/chevron-right" size="sm" aria-hidden="true" />
    </li>
  );
}

function BreadcrumbTrail({ className, view }: BreadcrumbTrailProps) {
  const lastItem = view.visibleItems[view.visibleItems.length - 1];
  const leadingItems = view.visibleItems.slice(0, -1);
  const dropdownItems = toDropdownItems(view.hiddenItems);

  return (
    <ol
      className={cn(
        'breadcrumb-trail flex w-full min-w-0 m-0 p-0 items-center gap-(--abc-spacing-gap-xs) list-none',
        className
      )}
    >
      {leadingItems.map(({ index, item }) => (
        <Fragment key={index}>
          <li
            className={cn(
              'breadcrumb-item flex min-w-0 max-w-max',
              index === 0 ? 'breadcrumb-home flex-none items-center' : 'flex-1'
            )}
          >
            <BreadcrumbLabel item={item} isLastItem={false} truncate={index > 0} />
          </li>
          <BreadcrumbSeparator />
        </Fragment>
      ))}
      {dropdownItems.length > 0 && (
        <>
          <li className="breadcrumb-overflow flex flex-none items-center">
            <BreadcrumbOverflow items={dropdownItems} />
          </li>
          <BreadcrumbSeparator />
        </>
      )}
      {lastItem && (
        <li
          className={cn(
            'breadcrumb-item flex min-w-0 max-w-max',
            lastItem.index === 0 ? 'breadcrumb-home flex-none items-center' : 'flex-1'
          )}
        >
          <BreadcrumbLabel isLastItem item={lastItem.item} truncate={lastItem.index > 0} />
        </li>
      )}
    </ol>
  );
}

/** Renders ancestor navigation with responsive collapse and shared label widths. */
export function BaseBreadcrumb({ breadcrumbItems, className }: BaseBreadcrumbProps) {
  if (breadcrumbItems.length === 0) return null;

  const items = breadcrumbItems.map((item, index) => ({ index, item }));
  const mobileView = createView(items, 2);
  const desktopView = createView(items, 3);
  const hasResponsiveCollapse = mobileView.hiddenItems.length > 0;

  return (
    <nav aria-label="Breadcrumb" className={cn('base-breadcrumb w-full min-w-0', className)}>
      <BreadcrumbTrail
        className={hasResponsiveCollapse ? 'breadcrumb-trail-mobile md:hidden' : undefined}
        view={mobileView}
      />
      {hasResponsiveCollapse && (
        <BreadcrumbTrail
          className="breadcrumb-trail-desktop hidden md:flex"
          view={desktopView}
        />
      )}
    </nav>
  );
}
