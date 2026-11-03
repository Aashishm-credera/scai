import type { JSX } from 'react';
import { sanitizeHeadingHtml } from '@/components/foundation/heading/heading-field';
import {
  isDescriptionEmpty,
  sanitizeDescriptionHtml,
} from '@/components/foundation/rich-text/description-field';
import { Accordion, type AccordionItemData } from '@/design-system/molecules/Accordion';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { AccordionItemFields, AccordionRenderingProps } from './accordion.props';

const textOf = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const toAnchor = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Anchors become element ids and `#anchor` deep links, so they must be unique on the page. An
 * authored anchor wins; otherwise the question is slugged, then the item id as a last resort.
 */
const resolveItems = (results: Array<AccordionItemFields | null>, isEditing: boolean) => {
  const used = new Set<string>();

  return results.flatMap((item): AccordionItemData[] => {
    if (!item?.id) return [];

    const question = getFieldValue(item.Question) ?? { value: '' };
    const answer = getFieldValue(item.Answer);
    const questionText = textOf(question.value);

    // A published item needs a question to press and an answer to reveal.
    if (!isEditing && (!questionText || isDescriptionEmpty(answer?.value))) return [];

    const base =
      toAnchor(textOf(getFieldValue(item.Anchor)?.value)) ||
      toAnchor(questionText) ||
      toAnchor(item.id);
    let anchor = base;
    for (let suffix = 2; used.has(anchor); suffix++) anchor = `${base}-${suffix}`;
    used.add(anchor);

    return [
      {
        anchor,
        question,
        // Page Builder edits the authored value; the published page gets the allowed tags only.
        answer: isEditing ? answer : { ...answer, value: sanitizeDescriptionHtml(answer?.value) },
      },
    ];
  });
};

export const Default = ({ fields, params, page }: AccordionRenderingProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? <span className="is-empty-hint">Missing Accordion Datasource</span> : null;
  }

  const title = getFieldValue(datasource.Title);
  const sanitizedTitle = sanitizeHeadingHtml(title?.value);
  const items = resolveItems(datasource.children?.results ?? [], isEditing);

  if (!isEditing && items.length === 0) return null;

  return (
    <>
      <Accordion
        id={params.RenderingIdentifier || undefined}
        className={params.styles?.trim() || undefined}
        title={isEditing ? title : sanitizedTitle ? { ...title, value: sanitizedTitle } : undefined}
        items={items}
        isEditing={isEditing}
      />
      {isEditing && items.length === 0 && (
        <span className="is-empty-hint">Add Accordion Item children to this datasource</span>
      )}
    </>
  );
};
