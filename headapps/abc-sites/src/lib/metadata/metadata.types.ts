import type { Field, ImageField, ImageFieldValue } from '@sitecore-content-sdk/nextjs';

/**
 * Item reference as serialized by the Layout Service for a Droptree field.
 */
export type ItemReferenceField = {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
} | null;

/**
 * Page-level metadata fields inherited from `_Base Page Metadata`
 * (/sitecore/templates/Foundation/abc/Metadata/_Base Page Metadata).
 */
export interface abcPageMetadataFields {
  PageTitle?: Field<string>;
  MetaDescription?: Field<string>;
  NavigationTitle?: Field<string>;
  CanonicalOverride?: ItemReferenceField;
  NoIndex?: Field<boolean>;
  SharedSocialTitle?: Field<string>;
  SharedSocialDescription?: Field<string>;
  OpenGraphImage?: ImageField;
  TwitterImage?: ImageField;
}

/**
 * Site-level metadata defaults from `{site root}/Settings/Site Metadata Settings`.
 */
export interface SiteMetadataSettings {
  /** Absolute origin used for canonical, hreflang and social URLs, e.g. https://www.heart.org */
  baseUrl: string;
  brandName?: string;
  author?: string;
  twitterSiteHandle?: string;
  socialFallbackImage?: ImageFieldValue;
}

/**
 * Site-relative path of a page per language. A locale is present only when the page has a
 * version in that language.
 */
export type PageLanguagePaths = Partial<Record<string, string>>;

export interface PageMetadataReferences {
  languagePaths: PageLanguagePaths;
  /** Site-relative path of the Canonical Override target in the current language, when it resolves. */
  canonicalOverridePath?: string;
}

export interface PageMetadataContext {
  locale: string;
  defaultLocale: string;
  /** Site-relative path of the current page, used when Sitecore does not return one (e.g. preview). */
  requestPath: string;
}
