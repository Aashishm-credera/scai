import type { RichTextField, TextField } from '@sitecore-content-sdk/nextjs';

export interface AccordionItemData {
  /** Unique within the page. Used as the item's element id, so `#anchor` deep links to it. */
  anchor: string;
  question: TextField;
  answer?: RichTextField;
}

export interface AccordionProps {
  id?: string;
  className?: string;
  /** Presents as the Sub-Heading Text h3. Without one, the questions become the h3s. */
  title?: RichTextField;
  items: AccordionItemData[];
  isEditing?: boolean;
}
