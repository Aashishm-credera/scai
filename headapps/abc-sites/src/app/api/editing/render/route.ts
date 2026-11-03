import type { NextRequest } from 'next/server';
import { createEditingRenderRouteHandlers } from '@sitecore-content-sdk/nextjs/route-handler';
import { routing } from '@/i18n/routing';

/**
 * API route to handler Sitecore Editor rendeing.
 * When using custom server URL, it should match the rendering host from your Sitecore configuration,
 * (see the settings item under /sitecore/content/<your/site/path>/Settings/Site Grouping).
 *
 * The route handler will:
 *  1. Extract data about the route we need to render from the Sitecore Editor GET request
 *  2. Enable Next.js Draft Mode
 *  3. Pass preview data as query string parameters, alongside required headers and cookies to an internal editing request
 *  4. Return the rendered HTML for editing mode
 */

const { POST, OPTIONS, GET: renderWithoutLanguage } = createEditingRenderRouteHandlers({});

// Pages sends the item path without a language and passes it as sc_lang instead. Without the
// prefix, LocaleProxy falls back to the default language, so the [locale] segment, and with it
// <html lang>, would be wrong for every non-default language version.
export function GET(req: NextRequest) {
  const language = req.nextUrl.searchParams.get('sc_lang');
  if (!language || !routing.locales.includes(language)) {
    return renderWithoutLanguage(req);
  }

  const { GET: renderWithLanguage } = createEditingRenderRouteHandlers({
    resolvePageUrl: (itemPath) => `/${language}${itemPath}`,
  });
  return renderWithLanguage(req);
}

export { POST, OPTIONS };
