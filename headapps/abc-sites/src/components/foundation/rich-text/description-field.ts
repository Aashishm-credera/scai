/**
 * Helpers for description fields authored as Rich Text: paragraphs, lists, bold, italics,
 * underline, superscript, subscript and inline links. Shared so every component with such a field cleans it the same way.
 */

import { isSafeButtonHref } from '@/design-system/atoms/BaseButton/link-utils';

/** Tags kept without attributes. Anchors are kept too, with their own attribute rules. */
const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'sup',
  'sub',
]);

/** Elements whose content is code, not copy, so it is dropped along with the tags. */
const NON_TEXT_ELEMENTS = /<(script|style)\b[\s\S]*?<\/\1\s*>/gi;

/**
 * A comment, a whole tag (capturing its closing slash and name), or a stray `<`.
 * Quoted attribute values may contain `>`.
 */
const MARKUP = /<!--[\s\S]*?-->|<(\/?)([a-z][a-z0-9]*)\b(?:"[^"]*"|'[^']*'|[^>"'])*>|</gi;

/** An opening anchor tag. Quoted attribute values may contain `>`. */
const ANCHOR_TAG = /<a\b(?:"[^"]*"|'[^']*'|[^>"'])*>/gi;

/** An attribute with a value, capturing its name and its double-quoted, single-quoted or bare value. */
const ATTRIBUTE = /\s([^\s"'=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/g;

const LINK_TARGET = /^_(?:blank|self|parent|top)$/i;

const NUMERIC_ENTITY = /&#(x[0-9a-f]+|[0-9]+);?/gi;

/** The named entities a browser would decode into characters that matter to a URL scheme. */
const NAMED_ENTITIES: Record<string, string> = {
  '&colon;': ':',
  '&tab;': '\t',
  '&newline;': '\n',
  '&amp;': '&',
};

const NAMED_ENTITY = /&(?:colon|tab|newline|amp);/gi;

const TAGS_AND_SPACES = /<[^>]*>|&nbsp;|&#160;|\s/gi;

/** Decodes an attribute value the way a browser does before it reads the URL scheme. */
const decodeHref = (href: string): string =>
  href
    .replace(NUMERIC_ENTITY, (match, code: string) => {
      const codePoint =
        code[0].toLowerCase() === 'x'
          ? Number.parseInt(code.slice(1), 16)
          : Number.parseInt(code, 10);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    })
    .replace(NAMED_ENTITY, (match) => NAMED_ENTITIES[match.toLowerCase()]);

/** Attribute values by lower-cased name. The first occurrence wins, as it does in a browser. */
const getAttributes = (tag: string): Map<string, string> => {
  const attributes = new Map<string, string>();

  for (const [, name, doubleQuoted, singleQuoted, bare] of tag.matchAll(ATTRIBUTE)) {
    const key = name.toLowerCase();
    if (!attributes.has(key)) attributes.set(key, doubleQuoted ?? singleQuoted ?? bare ?? '');
  }

  return attributes;
};

const isSafeHref = (href: string): boolean => isSafeButtonHref(decodeHref(href));

const toAttribute = (name: string, value: string): string =>
  ` ${name}="${value.replace(/"/g, '&quot;')}"`;

/** Rebuilds an opening anchor tag with only a safe href, a target and a title. */
const sanitizeAnchorTag = (anchorTag: string): string => {
  const attributes = getAttributes(anchorTag);
  const href = attributes.get('href');
  const target = attributes.get('target');
  const title = attributes.get('title');
  const opensNewTab = target?.toLowerCase() === '_blank';

  return [
    '<a',
    href !== undefined && isSafeHref(href) ? toAttribute('href', href) : '',
    target && LINK_TARGET.test(target) ? toAttribute('target', target.toLowerCase()) : '',
    opensNewTab ? toAttribute('rel', 'noopener noreferrer') : '',
    title ? toAttribute('title', title) : '',
    '>',
  ].join('');
};

/**
 * Keeps paragraphs, line breaks, lists, bold, italics, underline, superscript, subscript and links.
 * Every other tag is dropped and its text kept, and every attribute is dropped except a link's
 * href, target and title. A link whose destination is not a page, a web address, a page anchor,
 * an email address or a phone number loses its href, so a script URL never reaches the page.
 */
export const sanitizeDescriptionHtml = (html: string | null | undefined): string => {
  if (!html) return '';

  return html
    .replace(NON_TEXT_ELEMENTS, '')
    .replace(MARKUP, (match, closingSlash?: string, tagName?: string) => {
      if (!tagName) return match === '<' ? '&lt;' : '';

      const name = tagName.toLowerCase();
      if (name === 'a') return closingSlash ? '</a>' : sanitizeAnchorTag(match);
      if (!ALLOWED_TAGS.has(name)) return '';

      return name === 'br' ? '<br />' : `<${closingSlash}${name}>`;
    })
    .trim();
};

/** Whether any link in the value would lose its href in `sanitizeDescriptionHtml`. */
export const hasUnsafeDescriptionLink = (html: string | null | undefined): boolean =>
  (html?.match(ANCHOR_TAG) ?? []).some((anchorTag) => {
    const href = getAttributes(anchorTag).get('href');
    return href !== undefined && !isSafeHref(href);
  });

/** Whether the value has no visible text, such as the `<p><br></p>` an emptied editor leaves. */
export const isDescriptionEmpty = (html: string | null | undefined): boolean =>
  !html || html.replace(TAGS_AND_SPACES, '') === '';
