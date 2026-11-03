import type { ComponentPropsWithoutRef } from 'react';
import type { RichTextField } from '@sitecore-content-sdk/nextjs';

export interface DescriptionTextProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'dangerouslySetInnerHTML'
> {
  /** Backend-sanitized Rich Text field containing paragraphs, lists, and inline links. */
  DescriptionField?: RichTextField;
  /** Semantic body text scale, selected by the rendering's params.styles. Defaults to medium. */
  size?: 'l' | 'm' | 's';
  isEditing?: boolean;
}
