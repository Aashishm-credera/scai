/**
 * Languages the sites are routed and published in. Each must exist as a Sitecore language.
 * The default language (NEXT_PUBLIC_DEFAULT_LANGUAGE) is always added if missing.
 */
export const SUPPORTED_LOCALES = ['en', 'es'];

export function getSupportedLocales(defaultLanguage: string): string[] {
  return [...new Set([defaultLanguage, ...SUPPORTED_LOCALES])];
}
