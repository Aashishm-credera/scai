import type { ReactNode } from 'react';

export type BreadcrumbItem = {
  url: string;
  title?: ReactNode;
  tooltipLabel?: string;
};

export type BaseBreadcrumbProps = {
  /** Ancestors in site order, from Home through Parent; omit the current page. */
  breadcrumbItems: BreadcrumbItem[];
  className?: string;
};

export type IndexedBreadcrumbItem = {
  index: number;
  item: BreadcrumbItem;
};

export type BreadcrumbView = {
  hiddenItems: IndexedBreadcrumbItem[];
  visibleItems: IndexedBreadcrumbItem[];
};

export type BreadcrumbTrailProps = {
  className?: string;
  view: BreadcrumbView;
};

export type BreadcrumbLabelProps = {
  isLastItem: boolean;
  item: BreadcrumbItem;
  truncate: boolean;
};
