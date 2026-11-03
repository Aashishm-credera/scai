import type { ReactNode } from 'react';

/**
 * Stands in for whatever an author actually drops into a layout. Intentionally loud: the point of
 * the layout stories is to see cell boundaries, gutters and spans.
 */
export function DemoBlock({ children = 'Content' }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-abc-radius-md border border-(--abc-border-default-secondary) bg-abc-surface-default-secondary p-abc-spacing-inset-md text-center text-abc-text-default-secondary">
      {children}
    </div>
  );
}
