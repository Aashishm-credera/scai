import { NextFetchEvent, NextResponse, type NextRequest } from 'next/server';
import {
  defineProxy,
  AppRouterMultisiteProxy,
  PersonalizeProxy,
  RedirectsProxy,
  LocaleProxy,
  BotTrackingProxy,
  PreviewProxy,
} from '@sitecore-content-sdk/nextjs/proxy';
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';
import { routing } from './i18n/routing';
import client from './lib/sitecore-client';

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  // PreviewProxy authorizes preview requests
  const preview = new PreviewProxy({
    client: client,
    ...scConfig.api.edge,
  });

  // BotTrackingProxy will detect and track bots before any other proxies run
  const botTracking = new BotTrackingProxy({
    ...scConfig.api.edge,
    sites,
    fetchEvent: event,
  });

  // LocaleProxy and AppRouterMultisiteProxy must always run for App Router routing
  const locale = new LocaleProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    /**
     * List of all supported locales configured in routing.ts
     */
    locales: routing.locales.slice(),
    /**
     * Default language to use if no language is identified in the request
     */
    defaultLanguage: scConfig.defaultLanguage,
    // This function determines if the proxy should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
    // This is an important performance consideration since Next.js Edge proxy runs on every request.
    // in multilanguage scenarios, we need locale proxy to always run first to ensure locale is set and used correctly by the rest of the proxies
    skip: () => false,
  });

  const multisite = new AppRouterMultisiteProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.multisite,
    // This function determines if the proxy should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
    // This is an important performance consideration since Next.js Edge proxy runs on every request.
    skip: () => false,
  });

  // Instantiate proxies - they will use Edge config if available, otherwise fall back to local config
  // Each proxy will skip processing if required API configuration is not available
  const redirects = new RedirectsProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.api.local,
    ...scConfig.redirects,
    // This function determines if the proxy should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
    // By default it is disabled while in development mode.
    // This is an important performance consideration since Next.js Edge proxy runs on every request.
    skip: () => false,
  });

  const personalize = new PersonalizeProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.personalize,
    // This function determines if the proxy should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
    // By default it is disabled while in development mode.
    // This is an important performance consideration since Next.js Edge proxy runs on every request.
    // NOTE: Personalize requires Edge configuration and cannot work with local containers.
    // The proxy will disable itself if Edge config is not present.
    skip: () => false,
    // This is an example of how to provide geo data for personalization.
    // The provided callback will be called on each request to extract geo data.
    // extractGeoDataCb: () => {
    //   return {
    //     city: 'Athens',
    //     country: 'Greece',
    //     region: 'Attica',
    //   };
    // },
  });

  const httpsRedirect = redirectHttpToHttps(req);
  if (httpsRedirect) {
    return httpsRedirect;
  }

  if (!shouldRunSitecoreProxy(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return defineProxy(preview, botTracking, locale, multisite, redirects, personalize).exec(req);
}

// Static folders under /public must never reach the Sitecore proxies. With the `sc_preview`
// cookie (set by Page Builder), MultisiteProxy rewrites every path to /<site>/..., which turns
// e.g. /fonts/*.woff2 into a Sitecore page lookup that 404s. Keep in sync with `config.matcher`.
const SITECORE_PROXY_EXCLUDED_PATH =
  /^(?:api\/|sitemap|robots|_next\/|healthz|sitecore\/api\/|-\/|favicon\.ico|sc_logo\.svg|favicons\/|fonts\/|icons\/|logos\/)/;

function isHttpsRequest(request: NextRequest): boolean {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.split(',')[0]?.trim().toLowerCase() === 'https';
  }

  return request.nextUrl.protocol === 'https:';
}

function isHttpsRedirectDisabled(): boolean {
  return process.env.DISABLE_HTTPS_REDIRECT?.trim().toLowerCase() === 'true';
}

// Host the client actually requested. `request.nextUrl` always reflects the server's own
// address (e.g. localhost:3000), so it cannot be used to tell internal from public traffic.
function getRequestHost(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  return forwardedHost || request.headers.get('host') || request.nextUrl.host;
}

// Internal loopback requests, e.g. the editing render handler fetching the page from
// http://localhost:3000 on the SitecoreAI editing host, or container health checks.
const INTERNAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

function isInternalRequest(request: NextRequest): boolean {
  try {
    return INTERNAL_HOSTNAMES.has(new URL(`http://${getRequestHost(request)}`).hostname);
  } catch {
    return false;
  }
}

function redirectHttpToHttps(request: NextRequest): NextResponse | undefined {
  if (isHttpsRedirectDisabled() || isInternalRequest(request) || isHttpsRequest(request)) {
    return undefined;
  }

  const host = getRequestHost(request);
  const destination = new URL(
    `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  if (request.nextUrl.hash) {
    destination.hash = request.nextUrl.hash;
  }

  return NextResponse.redirect(destination, 308);
}

function shouldRunSitecoreProxy(pathname: string): boolean {
  const pathWithoutLeadingSlash = pathname.replace(/^\//, '');
  if (!pathWithoutLeadingSlash) {
    return true;
  }

  return !SITECORE_PROXY_EXCLUDED_PATH.test(pathWithoutLeadingSlash);
}

export const config = {
  /*
   * Match all paths except for:
   * 1. API route handlers
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 7. all root files inside /public
   * 8. static folders inside /public (favicons, fonts, icons, logos)
   */
  matcher: [
    '/',
    '/((?!api/|sitemap|robots|_next/|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg|favicons/|fonts/|icons/|logos/).*)',
  ],
};
