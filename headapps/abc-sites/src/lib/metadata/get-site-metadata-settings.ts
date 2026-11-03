import type { ImageFieldValue } from '@sitecore-content-sdk/nextjs';
import { cacheTag } from 'next/cache';
import graphQLClient from 'src/lib/graphql-client';
import { buildSitecoreItemCacheTag } from 'src/lib/cache/sitecore-item-cache-tag';
import { getSiteBaseUrl } from './site-url';
import type { SiteMetadataSettings } from './metadata.types';

/** Location of the settings item relative to the site root, e.g. /sitecore/content/abc/Heart */
const SITE_METADATA_SETTINGS_RELATIVE_PATH = 'Settings/Site Metadata Settings';

const SITE_INFO_QUERY = /* GraphQL */ `
  query SiteMetadataSiteInfoQuery($site: String!) {
    site {
      siteInfo(site: $site) {
        rootPath
        hostname
      }
    }
  }
`;

const SITE_METADATA_SETTINGS_QUERY = /* GraphQL */ `
  query SiteMetadataSettingsQuery($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      id
      brandName: field(name: "GlobalBrandName") {
        value
      }
      author: field(name: "Author") {
        value
      }
      twitterSiteHandle: field(name: "XTwitterSiteHandle") {
        value
      }
      socialFallbackImage: field(name: "GlobalSocialFallbackImage") {
        jsonValue
      }
    }
  }
`;

type SiteInfoResult = {
  site?: {
    siteInfo?: {
      rootPath?: string;
      hostname?: string;
    } | null;
  };
};

type TextFieldResult = { value?: string } | null;

type SiteMetadataSettingsResult = {
  item?: {
    id: string;
    brandName?: TextFieldResult;
    author?: TextFieldResult;
    twitterSiteHandle?: TextFieldResult;
    socialFallbackImage?: { jsonValue?: { value?: ImageFieldValue } } | null;
  } | null;
};

type GetSiteMetadataSettingsParams = {
  site: string;
  locale: string;
};

/**
 * Loads the site-level metadata defaults (brand, author, X/Twitter handle, social fallback image) and the
 * site's public origin. Cached with the settings item tag so publishing the item revalidates every page.
 */
export async function getSiteMetadataSettings(
  params: GetSiteMetadataSettingsParams
): Promise<SiteMetadataSettings> {
  'use cache';

  const { site, locale } = params;

  const siteInfoResult = await graphQLClient.request<SiteInfoResult>(SITE_INFO_QUERY, { site });
  const siteInfo = siteInfoResult.site?.siteInfo;
  const baseUrl = getSiteBaseUrl(site, siteInfo?.hostname);

  if (!siteInfo?.rootPath) {
    console.warn(`Site metadata settings: site "${site}" was not found; using defaults.`);
    return { baseUrl };
  }

  const result = await graphQLClient.request<SiteMetadataSettingsResult>(
    SITE_METADATA_SETTINGS_QUERY,
    {
      path: `${siteInfo.rootPath}/${SITE_METADATA_SETTINGS_RELATIVE_PATH}`,
      language: locale,
    }
  );

  const settings = result.item;
  if (!settings) {
    return { baseUrl };
  }

  cacheTag(buildSitecoreItemCacheTag(settings.id, locale));

  return {
    baseUrl,
    brandName: settings.brandName?.value?.trim() || undefined,
    author: settings.author?.value?.trim() || undefined,
    twitterSiteHandle: settings.twitterSiteHandle?.value?.trim() || undefined,
    socialFallbackImage: settings.socialFallbackImage?.jsonValue?.value,
  };
}
