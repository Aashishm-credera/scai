export interface DetailPageLinkItem {
  id: string;
  title: { value: string };
  description?: { value: string };
  image?: {
    value: {
      src: string;
      alt: string;
      width?: string | number;
      height?: string | number;
    };
  };
  link?: { value: { href?: string; target?: string } };
  /** Replaces the link's accessible name when set. */
  ariaLabel?: string;
}

export interface DetailPageLinksListProps {
  id?: string;
  className?: string;
  heading?: { value: string };
  cards: readonly DetailPageLinkItem[];
  /** Page Builder: cards are not links, so their fields can be edited inline. */
  isEditing?: boolean;
}
