import type { Item, LinkField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

export interface BaseButtonFields {
  /** The link text is the button label. */
  Link?: CompatibleField<LinkField>;
  /** Droptree of Icon items. Empty means no icon. */
  Icon?: CompatibleField<Item> | null;
}

export interface BaseButtonProps extends ComponentProps {
  fields?: CompatibleDatasource<BaseButtonFields>;
}
