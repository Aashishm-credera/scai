import type { JSX } from 'react';
import { RichText } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/design-system/lib/cn';
import type { DescriptionTextProps } from './description-text.props';

const sizeClassNames = {
  l: 'text-body-lg',
  m: 'text-body-md',
  s: 'text-body-sm',
} satisfies Record<NonNullable<DescriptionTextProps['size']>, string>;

const descriptionClassName = [
  'w-full min-w-0 max-w-full text-(--abc-text-default-secondary) wrap-anywhere whitespace-normal',
  '[&_:where(p,ul,ol)]:m-0',
  '[&_:where(p,ul,ol)+:where(p,ul,ol)]:[margin-block-start:var(--abc-spacing-gap-lg)]',
  '[&_:where(ul,ol)]:ps-(--abc-spacing-inset-4xl) [&_:where(ul,ol)]:list-outside',
  '[&_ul]:list-disc [&_ol]:ps-0 [&_ol]:list-decimal',
  '[&_li]:list-item [&_li]:ps-(--abc-spacing-inset-xs)',
  '[&_li+li]:[margin-block-start:var(--abc-spacing-gap-sm)]',
  '[&_li>:where(ul,ol)]:[margin-block-start:var(--abc-spacing-gap-sm)]',
  '[&_li::marker]:text-inherit [&_li::marker]:[font:inherit]',
  // Use the native list counter and suppress duplicate accessible text for the visual badge.
  '[&_ol>li]:relative [&_ol>li]:ps-[calc(1lh+var(--abc-spacing-gap-sm))]',
  "[&_ol>li::marker]:content-[''] [&_ol>li]:before:content-[counter(list-item)/'']",
  '[&_ol>li]:before:absolute [&_ol>li]:before:[inset-block-start:0] [&_ol>li]:before:start-0',
  '[&_ol>li]:before:inline-flex [&_ol>li]:before:items-center [&_ol>li]:before:justify-center',
  '[&_ol>li]:before:box-border [&_ol>li]:before:[inline-size:1lh] [&_ol>li]:before:[block-size:1lh]',
  '[&_ol>li]:before:rounded-(--abc-radius-pill) [&_ol>li]:before:bg-(--abc-surface-default-tertiary)',
  '[&_ol>li]:before:text-(--abc-text-default-secondary) [&_ol>li]:before:[font:inherit]',
  '[&_a[href]]:rounded-(--abc-radius-2xs) [&_a[href]]:text-(--abc-text-brand-brand-1-secondary)',
  '[&_a[href]]:underline [&_a[href]]:underline-offset-[0.15em] [&_a[href]]:box-decoration-clone',
  '[&_a[href]]:hover:text-(--abc-surface-brand-brand-1-secondary-hover)',
  '[&_a[href]]:focus-visible:outline-2 [&_a[href]]:focus-visible:outline-offset-2',
  '[&_a[href]]:focus-visible:outline-(--abc-border-focus)',
  'forced-colors:[&_a[href]]:focus-visible:outline-[Highlight]',
].join(' ');

/**
 * Renders backend rich text with native paragraph, list, and link semantics.
 * @param props Backend field, authoring state, and optional container attributes.
 * @returns Responsive description copy, or nothing for empty published content.
 */
export function DescriptionText({
  DescriptionField,
  size = 'm',
  isEditing = false,
  className,
  ...richTextProps
}: DescriptionTextProps): JSX.Element | null {
  if (!DescriptionField) return null;

  // The backend adapter supplies sanitized copy; preserve its field and editing metadata.
  const hasText = DescriptionField.value?.replace(/<[^>]*>|&nbsp;|&#160;|\s/gi, '');
  if (!isEditing && !hasText) return null;

  return (
    <RichText
      {...richTextProps}
      tag="div"
      className={cn(descriptionClassName, sizeClassNames[size], className)}
      field={DescriptionField}
    />
  );
}
