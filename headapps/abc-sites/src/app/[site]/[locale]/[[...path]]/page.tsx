import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { setCachedPageParams, Page as SitecorePage, SiteInfo } from '@sitecore-content-sdk/nextjs';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { Metadata } from 'next';
import sites from '.sitecore/sites.json';
import { routing } from 'src/i18n/routing';
import scConfig from 'sitecore.config';
import client from 'src/lib/sitecore-client';
import { getSitecorePage } from 'src/lib/cache/get-sitecore-page';
import { resolveNotFoundMetadata, resolvePageMetadata } from 'src/lib/metadata/resolve-page-metadata';
import { BUILD_VALIDATION_SITE, isBuildValidationSite } from 'src/lib/sitecore-build-validation';
import Layout from 'src/Layout';
import Providers from 'src/Providers';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type PageProps = {
  params: Promise<{ site: string; locale: string; path?: string[]; [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type LoadPageParams = {
  site: string;
  locale: string;
  path?: string[];
  isDraft: boolean;
  searchParams: PageProps['searchParams'];
};

// Draft/preview first so editing is not blocked by locale-dependent cached lookups.
// Editing often resolves language via query string, while [locale] may fall back to defaultLanguage.
async function loadPage({ site, locale, path, isDraft, searchParams }: LoadPageParams): Promise<SitecorePage | null> {
  if (isDraft) {
    const editingParams = await searchParams;
    return isDesignLibraryPreviewData(editingParams)
      ? client.getDesignLibraryData(editingParams)
      : client.getPreview(editingParams);
  }

  return getSitecorePage({ site, locale, path: path ?? [] });
}

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale, path } = await params;

  if (isBuildValidationSite(site)) {
    setCachedPageParams({ site, locale });
    notFound();
  }

  // Set site and locale to be available in src/i18n/request.ts for fetching the dictionary
  setRequestLocale(`${site}_${locale}`);

  const draft = await draftMode();
  const page = await loadPage({ site, locale, path, isDraft: draft.isEnabled, searchParams });

  // If the page is not found, return a 404
  if (!page) {
    setCachedPageParams({ site, locale });
    notFound();
  }

  return (
    <NextIntlClientProvider>
      <Providers page={page}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
    const siteNames = [...new Set(sites.map((site: SiteInfo) => site.name))];
    const staticParams = await client.getAppRouterStaticParams(siteNames, routing.locales.slice());
    // Cache Components rejects an empty result, so fall through to the placeholder when Edge returns no pages.
    if (staticParams.length > 0) {
      return staticParams;
    }
    console.warn(
      `generateStaticParams: no static paths returned for sites [${siteNames.join(', ')}] and locales [${routing.locales.join(', ')}]; using build validation placeholder.`
    );
  }
  return [
    {
      site: BUILD_VALIDATION_SITE,
      locale: routing.defaultLocale || scConfig.defaultLanguage,
      path: [],
    },
  ];
};
// Metadata for the page <head>. Mirrors the Page draft-mode branching so the <title> matches the body.
export const generateMetadata = async ({ params, searchParams }: PageProps): Promise<Metadata> => {
  const { path, site, locale } = await params;

  if (isBuildValidationSite(site)) {
    return { title: 'Page' };
  }

  const draft = await draftMode();
  const page = await loadPage({ site, locale, path, isDraft: draft.isEnabled, searchParams });

  // The page renders not-found.tsx; its <head> comes from the site's SitecoreAI 404 page.
  if (!page) {
    return resolveNotFoundMetadata({ site, locale });
  }

  return resolvePageMetadata({
    // Editing and preview resolve site and language from the query string rather than the route params.
    site: page.siteName || site,
    locale: page.locale || locale,
    route: page.layout.sitecore.route,
    requestPath: `/${(path ?? []).join('/')}`,
  });
};
