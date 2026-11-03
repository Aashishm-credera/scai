import type { Metadata } from 'next';
import { ErrorPage, type RouteData } from '@sitecore-content-sdk/nextjs';
import { routing } from 'src/i18n/routing';
import { getSitecoreErrorPage } from 'src/lib/cache/get-sitecore-error-page';
import { buildPageMetadata, buildPageTitle, getMetaDescription } from './build-page-metadata';
import { getPageMetadataReferences } from './get-page-metadata-references';
import { getSiteMetadataSettings } from './get-site-metadata-settings';
import { getSiteBaseUrl } from './site-url';
import type {
  abcPageMetadataFields,
  PageMetadataReferences,
  SiteMetadataSettings,
} from './metadata.types';

type ResolvePageMetadataParams = {
  site: string;
  locale: string;
  route: RouteData | null | undefined;
  /** Site-relative request path, e.g. /about-us */
  requestPath: string;
};

async function loadSettings(site: string, locale: string): Promise<SiteMetadataSettings> {
  try {
    return await getSiteMetadataSettings({ site, locale });
  } catch (error) {
    console.error(`Failed to load site metadata settings for site "${site}" (${locale}).`, error);
    return { baseUrl: getSiteBaseUrl(site) };
  }
}

async function loadReferences(
  itemId: string | undefined,
  locale: string,
  canonicalOverrideId: string | undefined
): Promise<PageMetadataReferences> {
  if (!itemId) {
    return { languagePaths: {} };
  }

  try {
    return await getPageMetadataReferences({
      itemId,
      locale,
      locales: routing.locales.slice(),
      canonicalOverrideId,
    });
  } catch (error) {
    console.error(`Failed to load metadata references for item ${itemId} (${locale}).`, error);
    return { languagePaths: {} };
  }
}

const DEFAULT_NOT_FOUND_TITLE = 'Page not found';

/**
 * <head> metadata for a 404 response, taken from the site's SitecoreAI 404 page (Settings > Error404Page).
 * The body is rendered by not-found.tsx, but Next.js takes the <head> from the route's generateMetadata.
 * Only title and description are output: Next.js adds the noindex robots tag to not-found responses,
 * and canonical/hreflang/social tags do not apply to a missing URL.
 */
export async function resolveNotFoundMetadata(params: {
  site: string;
  locale: string;
}): Promise<Metadata> {
  const { site, locale } = params;

  const [settings, errorPage] = await Promise.all([
    loadSettings(site, locale),
    getSitecoreErrorPage({ site, locale, code: ErrorPage.NotFound }).catch((error) => {
      console.error(`Failed to load the 404 page for site "${site}" (${locale}).`, error);
      return null;
    }),
  ]);

  const route = errorPage?.layout.sitecore.route;
  const fields = (route?.fields ?? {}) as abcPageMetadataFields;

  return {
    title: {
      absolute: buildPageTitle(
        fields,
        route?.displayName || DEFAULT_NOT_FOUND_TITLE,
        settings.brandName
      ),
    },
    description: getMetaDescription(fields),
  };
}

/**
 * Resolves the complete <head> metadata for a Sitecore page: page fields from the layout response,
 * site defaults from Site Metadata Settings, and language versions / canonical target from GraphQL.
 */
export async function resolvePageMetadata(params: ResolvePageMetadataParams): Promise<Metadata> {
  const { site, locale, route, requestPath } = params;
  const fields = (route?.fields ?? {}) as abcPageMetadataFields;
  const canonicalOverrideId = fields.CanonicalOverride?.id || undefined;

  const [settings, references] = await Promise.all([
    loadSettings(site, locale),
    loadReferences(route?.itemId, locale, canonicalOverrideId),
  ]);

  return buildPageMetadata({
    fields,
    fallbackTitle: route?.displayName || route?.name || '',
    settings,
    references,
    context: {
      locale,
      defaultLocale: routing.defaultLocale,
      requestPath,
    },
  });
}
