import type { ComponentProps } from 'react';
import { cn } from '@/design-system/lib/cn';

export const COLUMN_SPANS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type ColumnSpan = (typeof COLUMN_SPANS)[number];

/**
 * Every span is full width on mobile, and only splits into columns from `md:` up. Mobile uses
 * `col-span-full` rather than a number, so it stays correct whatever the mobile column count is.
 *
 * Only `md:`/`lg:`/`xl:` exist. `design-tokens/scripts/generate.mjs` sets them to the
 * client's breakpoints (480/1024/1600px) via `--breakpoint-md/lg/xl` in
 * `src/design-system/tokens/generated/theme.css`, and resets Tailwind's stock `sm:` and `2xl:` so they compile
 * to nothing. Mobile (< 480px) is the un-prefixed base. A `sm:` written here would silently do
 * nothing rather than error.
 *
 * Because this map is a finite list living in source, Tailwind's content scanner sees every
 * class it can produce. The grid itself needs no `@source` safelist entry.
 */
const SPAN_CLASSES: Record<ColumnSpan, string> = {
  1: 'col-span-full md:col-span-1',
  2: 'col-span-full md:col-span-2',
  3: 'col-span-full md:col-span-3',
  4: 'col-span-full md:col-span-4',
  5: 'col-span-full md:col-span-5',
  6: 'col-span-full md:col-span-6',
  7: 'col-span-full md:col-span-7',
  8: 'col-span-full md:col-span-8',
  9: 'col-span-full md:col-span-9',
  10: 'col-span-full md:col-span-10',
  11: 'col-span-full md:col-span-11',
  12: 'col-span-full',
};

export const isColumnSpan = (value: unknown): value is ColumnSpan =>
  COLUMN_SPANS.some((span) => span === value);

export type BaseColumnProps = ComponentProps<'div'> & {
  /** Columns out of 12 from 480px up. Unset, the column takes the grid's natural single track. */
  span?: ColumnSpan;
};

/**
 * A slice of a Row's grid. Only meaningful as a direct child of a Row. min-w-0 because a grid item
 * otherwise refuses to shrink below its content, and a long word or wide image would push the
 * column past its track and the page past the viewport.
 */
export function BaseColumn({ span, className, ...props }: BaseColumnProps) {
  return <div className={cn('min-w-0', span && SPAN_CLASSES[span], className)} {...props} />;
}
