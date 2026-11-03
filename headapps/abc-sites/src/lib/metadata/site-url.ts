const DEFAULT_BASE_URL = 'http://localhost:3000';

/**
 * Optional per-site origin override for non-production environments, e.g.
 * SITE_BASE_URLS={"Heart":"https://uat.heart.org"}
 */
function getBaseUrlOverride(siteName: string): string | undefined {
  const raw = process.env.SITE_BASE_URLS;
  if (!raw) {
    return undefined;
  }

  try {
    const overrides = JSON.parse(raw) as Record<string, string>;
    return overrides[siteName];
  } catch {
    console.warn('SITE_BASE_URLS is not valid JSON and will be ignored.');
    return undefined;
  }
}

/**
 * Resolves the public origin of a site. Uses the SITE_BASE_URLS override when configured, otherwise the
 * first non-wildcard host name of the Sitecore site definition (Site Grouping > HostName).
 */
export function getSiteBaseUrl(siteName: string, siteHostName?: string | null): string {
  const override = getBaseUrlOverride(siteName);
  if (override) {
    return trimTrailingSlash(override);
  }

  const hostName = siteHostName
    ?.split('|')
    .map((host) => host.trim())
    .find((host) => host && !host.includes('*'));

  return hostName ? `https://${hostName}` : DEFAULT_BASE_URL;
}

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

/**
 * Makes a media or page URL absolute against the site origin. Absolute URLs are returned unchanged.
 */
export function toAbsoluteUrl(url: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  return `${trimTrailingSlash(baseUrl)}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Builds the absolute public URL of a page for a locale. Mirrors the `localePrefix: 'as-needed'` routing:
 * the default locale has no prefix, every other locale is prefixed (e.g. /es/about).
 */
export function buildLocalizedPageUrl(params: {
  baseUrl: string;
  path: string;
  locale: string;
  defaultLocale: string;
}): string {
  const { baseUrl, locale, defaultLocale } = params;
  const path = stripLanguageSegment(normalizePath(params.path), locale);
  const localePrefix = locale.toLowerCase() === defaultLocale.toLowerCase() ? '' : `/${locale}`;
  const localizedPath = `${localePrefix}${path === '/' ? '' : path}` || '/';

  return `${trimTrailingSlash(baseUrl)}${localizedPath}`;
}

function normalizePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] || '/';
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : withLeadingSlash;
}

/** Sitecore may embed the language in generated paths; the locale prefix is added by our routing instead. */
function stripLanguageSegment(path: string, locale: string): string {
  const prefix = `/${locale.toLowerCase()}`;
  const lowerPath = path.toLowerCase();

  if (lowerPath === prefix) {
    return '/';
  }

  return lowerPath.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path;
}

/**
 * Converts a Sitecore language to an Open Graph locale, e.g. en -> en_US, es -> es_US, en-CA -> en_CA.
 */
export function toOpenGraphLocale(locale: string): string {
  const [language, region] = locale.split(/[-_]/);
  return `${language.toLowerCase()}_${(region || 'US').toUpperCase()}`;
}
