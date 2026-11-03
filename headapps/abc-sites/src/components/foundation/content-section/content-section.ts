import type {
  ComponentParams,
  ComponentRendering,
  Field,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { CompatibleDatasource, CompatibleField } from '@/lib/component-props';
import { sanitizeHeadingHtml } from '@/components/foundation/heading/heading-field';

/** Shared because In-Page Sidebar Navigation reads Content Section renderings from layout data. */
export interface ContentSectionFields {
  /** Rich Text so it can hold superscript and subscript. The sidebar navigation links to it. */
  Heading?: CompatibleField<RichTextField>;
  /** Paragraphs, bulleted lists and numbered lists, with inline links in any of them. */
  Description?: CompatibleField<RichTextField>;
  /** Shown under the heading in the sidebar navigation only. Content Section never renders it. */
  SubText?: CompatibleField<Field<string>>;
}

/** Readable anchor text, so `#heart-attack-warning-signs` rather than a uid lands in shared links. */
const toHeadingSlug = (headingHtml: string | null | undefined): string =>
  sanitizeHeadingHtml(headingHtml)
    .replace(/<[^>]*>|&[^;\s]*;/g, ' ')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * The id on a Content Section's heading. In-Page Sidebar Navigation links to it, so both build it
 * here. When authors leave Rendering Identifier blank it falls back to the heading text, then to
 * the rendering uid for headings with no letters or digits.
 */
export const getContentSectionHeadingId = (
  params: ComponentParams | undefined,
  headingHtml: string | null | undefined,
  uid: string | undefined
): string | undefined =>
  params?.RenderingIdentifier || toHeadingSlug(headingHtml) || (uid ? `section-${uid}` : undefined);

/** Number titled sections within their placeholder, matching the sidebar navigation order. */
export function getContentSectionNumber(
  placeholders: ComponentRendering['placeholders'],
  uid: string | undefined
): number | undefined {
  if (!uid) return undefined;

  for (const components of Object.values(placeholders ?? {})) {
    const sections = components.filter((component) => {
      if (component.componentName !== 'ContentSection') return false;
      const datasource = getDatasource(
        component.fields as CompatibleDatasource<ContentSectionFields> | undefined
      );
      const heading = getFieldValue(datasource?.Heading)?.value;
      return Boolean(
        getContentSectionHeadingId(component.params, heading, component.uid) &&
        sanitizeHeadingHtml(heading)
      );
    });
    const index = sections.findIndex((section) => section.uid === uid);
    if (index !== -1) return index + 1;

    for (const component of components) {
      const number = getContentSectionNumber(component.placeholders, uid);
      if (number !== undefined) return number;
    }
  }
  return undefined;
}
