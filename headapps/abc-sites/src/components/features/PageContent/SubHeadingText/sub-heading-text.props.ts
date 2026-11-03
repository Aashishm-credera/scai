import type { RichTextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

export interface SubHeadingTextFields {
  /** Rich Text content. The Sitecore validation rule limits it to 120 characters, not counting spaces. */
  SubHeading?: CompatibleField<RichTextField>;
}

export interface SubHeadingTextRenderingProps extends ComponentProps {
  fields?: CompatibleDatasource<SubHeadingTextFields>;
}
