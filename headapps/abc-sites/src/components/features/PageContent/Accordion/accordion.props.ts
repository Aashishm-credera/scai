import type { Field, RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

/** One question and answer: a child item of the Accordion datasource. */
export interface AccordionItemFields {
  id: string;
  Question?: CompatibleField<TextField> | null;
  /** Rich Text with the Description Text (#236933) links and lists. */
  Answer?: CompatibleField<RichTextField> | null;
  /** The `#anchor` that deep links to this item. Defaults to a slug of the question. */
  Anchor?: CompatibleField<Field<string>> | null;
}

export interface AccordionFields {
  /** Rich Text so it can hold superscript and subscript, like Sub-Heading Text. */
  Title?: CompatibleField<RichTextField> | null;
  children?: { results?: Array<AccordionItemFields | null> | null } | null;
}

export interface AccordionRenderingProps extends ComponentProps {
  fields?: CompatibleDatasource<AccordionFields>;
}
