import {  Item, LinkField, RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

export interface CalloutBoxFields {
  Icon?: CompatibleField<Item>,
  Link?: CompatibleField<LinkField>,
  Title?: CompatibleField<TextField>,
  Description?: CompatibleField<RichTextField>,
}

export interface CalloutBoxProps extends ComponentProps {
  fields?: CompatibleDatasource<CalloutBoxFields>;
}
