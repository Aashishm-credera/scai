import type { Field, ImageField, Item } from '@sitecore-content-sdk/nextjs';
import type { CompatibleField, ComponentProps } from '@/lib/component-props';
import type { BreadcrumbPage } from '@/components/foundation/breadcrumb/breadcrumb-items';

/** A Guide Status Tag item from the shared list, reached through the Status Tag Droplink. */
export interface GuideStatusTagFields {
  id?: string;
  Text?: CompatibleField<Field<string>> | null;
  /** Droptree of Icon items. The query aliases the item path as `url` for `getIconName`. */
  Icon?: { targetItem?: Partial<Item> | null } | null;
}

export interface GuideHeaderFields {
  BackgroundImage?: CompatibleField<ImageField> | null;
  FocalPointX?: CompatibleField<Field<string | number>> | null;
  FocalPointY?: CompatibleField<Field<string | number>> | null;
  Title?: CompatibleField<Field<string>> | null;
  Description?: CompatibleField<Field<string>> | null;
  /** ISO date; an empty field arrives as 0001-01-01T00:00:00Z. */
  StatusDate?: CompatibleField<Field<string>> | null;
  StatusTag?: { targetItem?: GuideStatusTagFields | null } | null;
}

/** Shape returned by the rendering's Component GraphQL Query. */
export interface GuideHeaderProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: GuideHeaderFields | null;
      contextItem?: { ancestors?: BreadcrumbPage[] | null } | null;
    } | null;
  } | null;
}
