import type { RichTextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

export interface DescriptionTextFields {
  /** Paragraphs, bulleted lists and numbered lists, with inline links in any of them. */
  Description?: CompatibleField<RichTextField>;
}

/**
 * The text size is not a field or parameter of its own. It arrives in `params.styles` as one of
 * the Description Text Size style classes: `description-text-size-l`, `-m` or `-s`.
 */
export interface DescriptionTextProps extends ComponentProps {
  fields?: CompatibleDatasource<DescriptionTextFields>;
}
