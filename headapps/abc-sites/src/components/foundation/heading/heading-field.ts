/**
 * Helpers for heading fields authored as Rich Text so they can hold superscript and subscript.
 * Shared so every component with such a field cleans it the same way.
 */

const ALLOWED_TAGS = new Set(['sup', 'sub']);

/** A comment, a whole tag (capturing its closing slash and name), or a stray `<`. */
const MARKUP = /<!--[\s\S]*?-->|<(\/?)([a-z][a-z0-9]*)\b[^>]*>|</gi;

/**
 * Keeps the text plus `<sup>` and `<sub>`, without attributes. Every other tag is dropped and its
 * text kept, so the `<p>` the editor wraps the value in never ends up inside the heading element.
 */
export const sanitizeHeadingHtml = (html: string | null | undefined): string => {
  if (!html) return '';

  return html
    .replace(MARKUP, (match, closingSlash?: string, tagName?: string) => {
      if (!tagName) return match === '<' ? '&lt;' : '';

      const name = tagName.toLowerCase();
      return ALLOWED_TAGS.has(name) ? `<${closingSlash}${name}>` : '';
    })
    .trim();
};
