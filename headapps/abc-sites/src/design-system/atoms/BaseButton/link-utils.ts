const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const INTERNAL_URL_BASE = 'https://internal.invalid';

/** Returns whether a destination is non-empty, well-formed, and non-executable. */
export function isSafeButtonHref(href: string): boolean {
  const value = href.trim();
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return false;

  try {
    return SAFE_PROTOCOLS.has(new URL(value, INTERNAL_URL_BASE).protocol);
  } catch {
    return false;
  }
}
