import type { RichTextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

export interface HeadingTextFields {
  /** Rich Text so it can hold superscript and subscript. Limited to 25 visible characters. */
  Heading?: CompatibleField<RichTextField>;
}

export interface HeadingTextProps extends ComponentProps {
  fields?: CompatibleDatasource<HeadingTextFields>;
}
