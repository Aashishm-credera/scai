import type { PlaceholderComponentProps } from '@/lib/component-props';

/** One sidebar link, built from a Content Section in the right column. */
export interface InPageSidebarNavItem {
  /** The Content Section heading's id, so the link scrolls to it. */
  id: string;
  /** The Content Section heading, with only sup and sub kept. */
  label: string;
  /** The Content Section's SubText. */
  subText?: string;
}

/** No datasource: the title is the `inThisGuide` dictionary phrase. */
export type InPageSidebarNavigationProps = PlaceholderComponentProps;
