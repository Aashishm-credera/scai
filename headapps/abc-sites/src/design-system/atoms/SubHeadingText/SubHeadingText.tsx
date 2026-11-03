import { JSX } from 'react';
import { RichText } from '@sitecore-content-sdk/nextjs';
import { type SubHeadingProps } from './sub-heading-text.types';

const SUB_HEADING_CLASSES =
  'block w-full min-w-0 max-w-full break-words whitespace-pre-line pb-(--abc-spacing-inset-lg) text-[color:var(--abc-text-default-primary)] font-sans font-bold text-[length:var(--abc-font-size-heading-sm)] leading-[var(--abc-font-line-height-heading-sm)] md:text-[length:var(--abc-font-size-heading-sm)] md:leading-[var(--abc-font-line-height-heading-sm)] lg:text-[length:var(--abc-font-size-heading-sm)] lg:leading-[var(--abc-font-line-height-heading-sm)] xl:text-[length:var(--abc-font-size-heading-sm)] xl:leading-[var(--abc-font-line-height-heading-sm)]';

export function SubHeadingText({
  SubHeadingField,
  isEditing,
  id,
  className,
  ...richTextProps
}: SubHeadingProps): JSX.Element | null {
  if (!SubHeadingField || (!SubHeadingField.value?.trim() && !isEditing)) {
    return null;
  }

  return (
    <RichText
      {...richTextProps}
      tag="h3"
      id={id}
      className={[SUB_HEADING_CLASSES, className].filter(Boolean).join(' ')}
      field={SubHeadingField}
    />
  );
}
