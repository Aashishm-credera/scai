import type { ComponentProps, ReactNode } from 'react';

export interface InPageSidebarNavItem {
  /** The id of the section this link points to. */
  id: string;
  label: ReactNode;
  subText?: string;
}

export interface InPageSidebarNavigationProps extends ComponentProps<'nav'> {
  title?: string;
  titleId?: string;
  closeLabel?: string;
  items: InPageSidebarNavItem[];
  /** Applies the selected treatment when the current section is known by the caller. */
  activeItemId?: string;
  /** Keep all links in normal flow while authors edit the page. */
  isEditing?: boolean;
}

export interface InPageSidebarNavigationLayoutProps extends ComponentProps<'div'> {
  navigation: ReactNode;
}
