'use client';

import { LinkDropdown } from '@/design-system/molecules/LinkDropdown';
import type { BreadcrumbOverflowProps } from './breadcrumb-overflow.props';

export type { BreadcrumbOverflowItem } from './breadcrumb-overflow.props';

export function BreadcrumbOverflow({ items }: BreadcrumbOverflowProps) {
  return (
    <LinkDropdown
      className={[
        // Override only the breadcrumb trigger; the shared dropdown owns its popup.
        '[&_.link-dropdown-trigger]:min-h-(--abc-space-32) [&_.link-dropdown-trigger]:min-w-(--abc-space-32)',
        '[&_.link-dropdown-trigger]:rounded-(--abc-radius-lg)',
        '[&_.link-dropdown-trigger]:py-(--abc-spacing-inset-xs) [&_.link-dropdown-trigger]:px-(--abc-spacing-inset-sm)',
        '[&_.link-dropdown-trigger]:text-(--abc-text-default-quaternary)',
        '[&_.link-dropdown-trigger-label]:text-(--abc-color-neutral-500)',
        '[&_.link-dropdown-trigger]:text-body-xs',
        '[&_.link-dropdown-trigger:hover]:bg-(--abc-surface-default-primary-hover)',
        '[&_.link-dropdown-trigger:hover]:text-(--abc-text-default-quaternary)',
        '[&_.link-dropdown-trigger:active]:bg-(--abc-surface-default-primary-hover)',
        '[&_.link-dropdown-trigger:active]:text-(--abc-text-default-quaternary)',
        '[&_.link-dropdown-trigger:focus-visible]:bg-(--abc-surface-default-primary-hover)',
        '[&_.link-dropdown-trigger:focus-visible]:text-(--abc-text-default-quaternary)',
        '[&_.link-dropdown-trigger:focus-visible]:shadow-[0_0_0_2px_var(--abc-surface-default-primary)]',
        '[&_.link-dropdown-trigger:focus-visible]:outline-2 [&_.link-dropdown-trigger:focus-visible]:outline-offset-2',
        '[&_.link-dropdown-trigger:focus-visible]:outline-(--abc-border-focus)',
        'forced-colors:[&_.link-dropdown-trigger:focus-visible]:outline-[Highlight]',
      ].join(' ')}
      items={items}
      navigationLabel="Hidden breadcrumb pages"
      triggerLabel="Show hidden breadcrumb pages"
    />
  );
}
