import type { Metadata } from 'next';
import type { Field, ImageField, ImageFieldValue } from '@sitecore-content-sdk/nextjs';
import { buildLocalizedPageUrl, toAbsoluteUrl, toOpenGraphLocale } from './site-url';
import type {
  abcPageMetadataFields,
  PageMetadataContext,
  PageMetadataReferences,
  SiteMetadataSettings,
} from './metadata.types';

const TWITTER_CARD = 'summary_large_image';
const OPEN_GRAPH_TYPE = 'website';
const X_DEFAULT = 'x-default';

type BuildPageMetadataParams = {
  fields: abcPageMetadataFields;
  /** Used when Page Title is empty, e.g. the item display name. */
  fallbackTitle: string;
  settings: SiteMetadataSettings;
  references: PageMetadataReferences;
  context: PageMetadataContext;
};

type ResolvedImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

function fieldText(field?: Field<string> | null): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

/** <title> format: [Page Title] | [Global Brand Name] */
export function buildPageTitle(
  fields: abcPageMetadataFields,
  fallbackTitle: string,
  brandName?: string
): string {
  const pageTitle = fieldText(fields.PageTitle) || fallbackTitle;
  return [pageTitle, brandName].filter(Boolean).join(' | ');
}

export function getMetaDescription(fields: abcPageMetadataFields): string | undefined {
  return fieldText(fields.MetaDescription) || undefined;
}

function isChecked(field?: Field<boolean> | null): boolean {
  const value: unknown = field?.value;
  return value === true || value === '1' || value === 'true';
}

function toPositiveNumber(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** Page image when authored, otherwise the Global Social Fallback Image. */
function resolveImage(
  pageImage: ImageField | undefined,
  fallbackImage: ImageFieldValue | undefined,
  baseUrl: string
): ResolvedImage | undefined {
  const image = pageImage?.value?.src ? pageImage.value : fallbackImage;
  if (!image?.src) {
    return undefined;
  }

  const alt = typeof image.alt === 'string' && image.alt.trim() ? image.alt.trim() : undefined;

  return {
    url: toAbsoluteUrl(image.src, baseUrl),
    width: toPositiveNumber(image.width),
    height: toPositiveNumber(image.height),
    alt,
  };
}

/**
 * Maps Sitecore page fields and site metadata settings to Next.js metadata, applying the inheritance rules:
 * - <title>: [Page Title] | [Global Brand Name]
 * - Shared Social Title / Description fall back to <title> / Meta Description
 * - og:image / twitter:image fall back to the Global Social Fallback Image
 * - canonical: Canonical Override target, otherwise the page's own absolute URL
 * - hreflang: every existing language version, plus x-default pointing to the default locale
 */
export function buildPageMetadata(params: BuildPageMetadataParams): Metadata {
  const { fields, fallbackTitle, settings, references, context } = params;
  const { baseUrl } = settings;
  const { locale, defaultLocale } = context;

  const title = buildPageTitle(fields, fallbackTitle, settings.brandName);
  const description = getMetaDescription(fields);
  const socialTitle = fieldText(fields.SharedSocialTitle) || title;
  const socialDescription = fieldText(fields.SharedSocialDescription) || description;

  const toPageUrl = (path: string, pageLocale: string) =>
    buildLocalizedPageUrl({ baseUrl, path, locale: pageLocale, defaultLocale });

  const selfUrl = toPageUrl(references.languagePaths[locale] ?? context.requestPath, locale);
  const canonicalUrl = references.canonicalOverridePath
    ? toPageUrl(references.canonicalOverridePath, locale)
    : selfUrl;

  const languages: Record<string, string> = {};
  for (const [language, path] of Object.entries(references.languagePaths)) {
    if (path) {
      languages[language] = toPageUrl(path, language);
    }
  }
  languages[locale] = selfUrl;
  if (languages[defaultLocale]) {
    languages[X_DEFAULT] = languages[defaultLocale];
  }

  const alternateLocales = Object.keys(languages)
    .filter((language) => language !== locale && language !== X_DEFAULT)
    .map(toOpenGraphLocale);

  const ogImage = resolveImage(fields.OpenGraphImage, settings.socialFallbackImage, baseUrl);
  const twitterImage = resolveImage(fields.TwitterImage, settings.socialFallbackImage, baseUrl);
  return {
    metadataBase: new URL(baseUrl),
    title: { absolute: title },
    description,
    ...(settings.author && { authors: [{ name: settings.author }] }),
    robots: { index: !isChecked(fields.NoIndex), follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url: canonicalUrl,
      type: OPEN_GRAPH_TYPE,
      ...(settings.brandName && { siteName: settings.brandName }),
      locale: toOpenGraphLocale(locale),
      ...(alternateLocales.length > 0 && { alternateLocale: alternateLocales }),
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: TWITTER_CARD,
      title: socialTitle,
      description: socialDescription,
      ...(settings.twitterSiteHandle && { site: settings.twitterSiteHandle }),
      ...(twitterImage && { images: [twitterImage] }),
    },
    other: {
      'twitter:url': canonicalUrl,
    },
  };
}
