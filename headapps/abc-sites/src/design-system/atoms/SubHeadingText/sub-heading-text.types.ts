import type { ComponentPropsWithoutRef } from 'react';
import type { RichTextField } from '@sitecore-content-sdk/nextjs';

export interface SubHeadingProps extends Omit<ComponentPropsWithoutRef<'h3'>, 'children'> {
  SubHeadingField?: RichTextField;
  isEditing: boolean;
}

export type SubHeadingTextProps = SubHeadingProps;
