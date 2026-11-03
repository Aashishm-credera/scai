import type { ComponentPropsWithoutRef } from 'react';
import type { RichTextField } from '@sitecore-content-sdk/nextjs';

export interface HeadingTextProps extends Omit<ComponentPropsWithoutRef<'h2'>, 'children'> {
  HeadingField?: RichTextField;
  isEditing: boolean;
}
