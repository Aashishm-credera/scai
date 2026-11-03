import type { ComponentProps } from 'react';
import { cn } from '@/design-system/lib/cn';

/**
 * A grid row, per Figma's Grids spec: 6 columns below 480px, 12 from 480px up. Gutters come
 * from `--abc-layout-container-grid-column-gap` (20 / 22 / 23 / 24px), which resizes itself at
 * each breakpoint, so no @media is written here. How wide each child is comes from Column.
 */
export function BaseRow({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-cols-6 gap-abc-layout-container-grid-column-gap md:grid-cols-12',
        className
      )}
      {...props}
    />
  );
}
