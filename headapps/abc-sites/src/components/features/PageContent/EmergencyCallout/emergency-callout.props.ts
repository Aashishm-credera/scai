import type { Field, Item, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

export interface EmergencyCalloutFields {
  /** Placeholder: replace with the datasource template fields. Names are case-sensitive JSON keys. */
  Title?: CompatibleField<Field<string>>;
  Icon?: CompatibleField<Item>,
  Link?: CompatibleField<LinkField>,
  Description?: CompatibleField<RichTextField>,
}

export interface EmergencyCalloutProps extends ComponentProps {
  fields?: CompatibleDatasource<EmergencyCalloutFields>;
}
