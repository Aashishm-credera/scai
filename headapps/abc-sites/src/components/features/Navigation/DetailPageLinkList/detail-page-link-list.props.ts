import type { Field, ImageField, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

/** Meta fields of the page a card links to, used when the card's override field is empty. */
export interface DetailPage {
  url?: { path?: string } | null;
  PageTitle?: { value?: string } | null;
  MetaDescription?: { value?: string } | null;
  OpenGraphImage?: CompatibleField<ImageField> | null;
}

/** One card: a child item of the Detail Page Link template. */
export interface DetailPageLinkFields {
  id: string;
  /** Droptree of a site page. */
  PageItem?: { targetItem?: DetailPage | null } | null;
  /** Overrides the Page Item link, e.g. with an external URL or a page anchor. */
  Link?: CompatibleField<LinkField> | null;
  /** Overrides the page's social image. */
  Image?: CompatibleField<ImageField> | null;
  /** Overrides the page's meta title. Limited to 60 characters. */
  Title?: CompatibleField<Field<string>> | null;
  /** Overrides the page's meta description. */
  Description?: CompatibleField<Field<string>> | null;
  /** From `_Accessibility Fields`. Replaces the link's accessible name when set. */
  AriaLabel?: CompatibleField<Field<string>> | null;
}

export interface DetailPageLinkListFields {
  /** Rich Text so it can hold superscript and subscript. Limited to 120 visible characters. */
  Heading?: CompatibleField<RichTextField> | null;
  children?: { results?: Array<DetailPageLinkFields | null> | null } | null;
}

/** The Heart `Settings/Site Metadata Settings` item, queried by ID next to the datasource. */
export interface DetailPageLinkListSiteSettings {
  GlobalSocialFallbackImage?: CompatibleField<ImageField> | null;
}

export interface DetailPageLinkListProps extends ComponentProps {
  fields?: CompatibleDatasource<DetailPageLinkListFields> & {
    data?: { siteSettings?: DetailPageLinkListSiteSettings | null };
  };
}
