import { JSX } from 'react';
import { HeadingText as HeadingTextUI } from '@/design-system/atoms/HeadingText';
import { sanitizeHeadingHtml } from '@/components/foundation/heading/heading-field';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { HeadingTextProps } from './heading-text.props';

export const Default = ({ fields, params, page }: HeadingTextProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Heading Text Datasource</span>
    ) : null;
  }

  const heading = getFieldValue(datasource.Heading);
  const sanitizedHeading = sanitizeHeadingHtml(heading?.value);

  // An empty heading still renders in Page Builder so authors can fill it in.
  if (!sanitizedHeading && !isEditing) {
    return null;
  }

  return (
    <HeadingTextUI
      HeadingField={isEditing ? heading : { ...heading, value: sanitizedHeading }}
      isEditing={isEditing}
      id={params.RenderingIdentifier || undefined}
      className={params.styles?.trim() || undefined}
    />
  );
};
