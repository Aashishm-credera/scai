import { cacheTag } from 'next/cache';
import graphQLClient from 'src/lib/graphql-client';
import { buildSitecoreItemCacheTag } from 'src/lib/cache/sitecore-item-cache-tag';
import type { PageLanguagePaths, PageMetadataReferences } from './metadata.types';

type ItemUrlResult = { url?: { path?: string } | null } | null;

type GetPageMetadataReferencesParams = {
  itemId: string;
  locale: string;
  /** Every locale the site routes (routing.locales); each becomes an hreflang candidate. */
  locales: string[];
  canonicalOverrideId?: string;
};

/**
 * Builds one query that resolves the page's URL in every supported language plus the Canonical Override
 * target. An item without a version in a language returns `null`, so that language is left out of hreflang.
 */
function buildReferencesQuery(locales: string[], includeCanonical: boolean): string {
  const languageVariables = locales.map((_, index) => `$language${index}: String!`);
  const languageSelections = locales.map(
    (_, index) =>
      `language${index}: item(path: $itemId, language: $language${index}) { url { path } }`
  );
  const canonicalVariables = includeCanonical
    ? ['$canonicalId: String!', '$currentLanguage: String!']
    : [];
  const canonicalSelection = includeCanonical
    ? ['canonical: item(path: $canonicalId, language: $currentLanguage) { url { path } }']
    : [];

  return /* GraphQL */ `
    query PageMetadataReferencesQuery(${['$itemId: String!', ...languageVariables, ...canonicalVariables].join(', ')}) {
      ${[...languageSelections, ...canonicalSelection].join('\n      ')}
    }
  `;
}

/**
 * Resolves the site-relative paths needed for hreflang alternates and the canonical override.
 * Cached with item tags for every language version, so publishing a translation refreshes the alternates
 * of the other language versions too.
 */
export async function getPageMetadataReferences(
  params: GetPageMetadataReferencesParams
): Promise<PageMetadataReferences> {
  'use cache';

  const { itemId, locale, locales, canonicalOverrideId } = params;
  const includeCanonical = Boolean(canonicalOverrideId);

  const variables: Record<string, string> = { itemId };
  locales.forEach((language, index) => {
    variables[`language${index}`] = language;
  });
  if (canonicalOverrideId) {
    variables.canonicalId = canonicalOverrideId;
    variables.currentLanguage = locale;
  }

  const result = await graphQLClient.request<Record<string, ItemUrlResult>>(
    buildReferencesQuery(locales, includeCanonical),
    variables
  );

  const languagePaths: PageLanguagePaths = {};
  locales.forEach((language, index) => {
    cacheTag(buildSitecoreItemCacheTag(itemId, language));

    const path = result[`language${index}`]?.url?.path;
    if (path) {
      languagePaths[language] = path;
    }
  });

  if (canonicalOverrideId) {
    cacheTag(buildSitecoreItemCacheTag(canonicalOverrideId, locale));
  }

  return {
    languagePaths,
    canonicalOverridePath: result.canonical?.url?.path || undefined,
  };
}
