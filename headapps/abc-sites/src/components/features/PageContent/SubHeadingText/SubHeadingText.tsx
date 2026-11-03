import { JSX } from 'react';
import { SubHeadingText as SubHeadingTextUI } from '@/design-system/atoms/SubHeadingText';
import { sanitizeHeadingHtml } from '@/components/foundation/heading/heading-field';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { SubHeadingTextRenderingProps } from './sub-heading-text.props';

const preserveSubHeadingLineBreaks = (html: string | null | undefined): string =>
  (html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<\/(?:li|p|div)\s*>/gi, '\n')
    .replace(/\n{2,}/g, '\n');

export const Default = ({
  fields,
  params,
  page,
}: SubHeadingTextRenderingProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Sub-Heading Text Datasource</span>
    ) : null;
  }

  const subHeading = getFieldValue(datasource.SubHeading);
  const sanitizedSubHeading = sanitizeHeadingHtml(preserveSubHeadingLineBreaks(subHeading?.value));

  if (!sanitizedSubHeading && !isEditing) return null;

  return (
    <SubHeadingTextUI
      SubHeadingField={isEditing ? subHeading : { ...subHeading, value: sanitizedSubHeading }}
      isEditing={isEditing}
      id={params.RenderingIdentifier || undefined}
      className={params.styles?.trim() || undefined}
    />
  );
};
