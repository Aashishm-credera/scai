import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/design-system/atoms/BaseBreadcrumb';

export const MAX_GUIDE_TITLE_LENGTH = 70;
export const MAX_GUIDE_DESCRIPTION_LENGTH = 160;
export const MAX_GUIDE_STATUS_LENGTH = 42;

export type GuideHeaderStatus = {
  label: ReactNode;
  date?: string;
  icon?: ReactNode;
};

export type GuideHeaderRenderingMetadata = {
  uid?: string;
  componentName?: string;
  dataSource?: string;
};

export type GuideHeaderPresentation = {
  id?: string;
  className?: string;
  metadata?: GuideHeaderRenderingMetadata;
  image?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  status?: GuideHeaderStatus;
  updatedLabel?: string;
};

export type GuideHeaderProps = GuideHeaderPresentation & {
  breadcrumbItems?: BreadcrumbItem[];
};
