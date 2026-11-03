import { JSX } from 'react';
import { DescriptionText  } from '@/design-system/atoms/DescriptionText';
import {
  hasUnsafeDescriptionLink,
  isDescriptionEmpty,
  sanitizeDescriptionHtml,
} from '@/components/foundation/rich-text/description-field';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { DescriptionTextProps } from './description-text.props';

export const Default = ({ fields, params, page }: DescriptionTextProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Description Text Datasource</span>
    ) : null;
  }

  const description = getFieldValue(datasource.Description);

  // An empty description still renders in Page Builder so authors can fill it in.
  if (isDescriptionEmpty(description?.value) && !isEditing) {
    return null;
  }

  // The size class (description-text-size-l | -m | -s) comes from the Description Text Size style.
  // Without one, medium is the default.
  const className = ['description-text', params.styles?.trim()].filter(Boolean).join(' ');
  const sizeStyle = params.styles
    ?.split(/\s+/)
    .find((style) => /^description-text-size-[lms]$/.test(style));
  const size =
    sizeStyle === 'description-text-size-l'
      ? 'l'
      : sizeStyle === 'description-text-size-s'
        ? 's'
        : 'm';

  return (
    <>
      <DescriptionText
        size={size}
        isEditing={isEditing}
        id={params.RenderingIdentifier || undefined}
        className={className}
        // Page Builder edits the authored value; the published page gets the allowed tags only.
        DescriptionField={
          isEditing
            ? description
            : { ...description, value: sanitizeDescriptionHtml(description?.value) }
        }
      />
      {isEditing && hasUnsafeDescriptionLink(description?.value) && (
        <span className="is-empty-hint">
          A link has a destination that is not allowed and will not work on the published page
        </span>
      )}
    </>
  );
};
