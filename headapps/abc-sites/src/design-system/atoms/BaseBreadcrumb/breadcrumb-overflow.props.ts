import type { LinkDropdownHrefItem } from '@/design-system/molecules/LinkDropdown';

export type BreadcrumbOverflowItem = Pick<LinkDropdownHrefItem, 'href' | 'id' | 'label'>;

export type BreadcrumbOverflowProps = {
  items: BreadcrumbOverflowItem[];
};
