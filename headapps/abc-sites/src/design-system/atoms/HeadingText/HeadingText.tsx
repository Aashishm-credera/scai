import { JSX } from 'react';
import { RichText } from '@sitecore-content-sdk/nextjs';

import type { HeadingTextProps } from './heading-text.types';

const HEADING_CLASSES =
  'block w-full min-w-0 max-w-abc-layout-container-max-width-reading wrap-anywhere text-abc-text-default-primary text-pretty text-heading-lg';

export function HeadingText({
  HeadingField,
  isEditing,
  id,
  className,
  ...richTextProps
}: HeadingTextProps): JSX.Element | null {
  if (!HeadingField || (!HeadingField.value?.trim() && !isEditing)) {
    return null;
  }

  return (
    <RichText
      {...richTextProps}
      tag="h2"
      id={id}
      className={[HEADING_CLASSES, className].filter(Boolean).join(' ')}
      field={HeadingField}
    />
  );
}
