import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

type SuppliedLinkProps = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children' | 'className' | 'onClick' | 'rel' | 'target'
>;

export type LinkDropdownHrefItem = {
  id: string;
  label: ReactNode;
  href: string;
  link?: never;
  rel?: string;
  target?: '_blank' | '_self';
};

export type LinkDropdownSlotItem = {
  id: string;
  label: ReactNode;
  href?: never;
  link: ReactElement<SuppliedLinkProps>;
  rel?: never;
  target?: never;
};

export type LinkDropdownItem = LinkDropdownHrefItem | LinkDropdownSlotItem;

export type LinkDropdownProps = {
  id?: string;
  className?: string;
  defaultOpen?: boolean;
  items: readonly LinkDropdownItem[];
  navigationLabel?: string;
  triggerLabel: string;
  /** Replaces the breadcrumb control with a native action button. */
  trigger?: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  disabled?: boolean;
};
