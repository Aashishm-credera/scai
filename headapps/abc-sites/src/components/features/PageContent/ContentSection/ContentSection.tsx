import { JSX } from 'react';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import { DescriptionText } from '@/design-system/atoms/DescriptionText';
import { HeadingText } from '@/design-system/atoms/HeadingText';
import { ContentSection } from '@/design-system/organisms/ContentSection';
import {
  getContentSectionHeadingId,
  getContentSectionNumber,
} from '@/components/foundation/content-section/content-section';
import { sanitizeHeadingHtml } from '@/components/foundation/heading/heading-field';
import {
  hasUnsafeDescriptionLink,
  isDescriptionEmpty,
  sanitizeDescriptionHtml,
} from '@/components/foundation/rich-text/description-field';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { ContentSectionProps } from './content-section.props';

export const Default = ({
  fields,
  params,
  page,
  rendering,
  componentMap,
}: ContentSectionProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Content Section Datasource</span>
    ) : null;
  }

  const heading = getFieldValue(datasource.Heading);
  const sanitizedHeading = sanitizeHeadingHtml(heading?.value);
  const description = getFieldValue(datasource.Description);
  const hasDescription = !isDescriptionEmpty(description?.value);

  // Dynamic so each Content Section on a page gets its own placeholder.
  const placeholderName = `content-section-${params.DynamicPlaceholderId}`;
  // Layout data keys the placeholder as `content-section-{*}` until AppPlaceholder resolves it to
  // placeholderName, so look it up by any key. Content Section has only this one placeholder.
  const hasComponents = Object.values(rendering.placeholders ?? {}).some(
    (components) => components.length > 0
  );

  if (!sanitizedHeading && !hasDescription && !hasComponents && !isEditing) {
    return null;
  }

  // The sidebar navigation links to the heading, so it needs an id even when authors leave
  // Rendering Identifier blank.
  const headingId = getContentSectionHeadingId(params, heading?.value, rendering.uid);
  const showHeading = Boolean(sanitizedHeading) || isEditing;

  return (
    <ContentSection
      headingNumber={getContentSectionNumber(
        page.layout.sitecore.route?.placeholders,
        rendering.uid
      )}
      className={params.styles?.trim() || undefined}
      aria-labelledby={showHeading ? headingId : undefined}
      heading={
        showHeading && (
          <HeadingText
            id={headingId}
            isEditing={isEditing}
            HeadingField={isEditing ? heading : { ...heading, value: sanitizedHeading }}
          />
        )
      }
      description={
        (hasDescription || isEditing) && (
          <DescriptionText
            size="l"
            isEditing={isEditing}
            // Page Builder edits the authored value; the published page gets the allowed tags only.
            DescriptionField={
              isEditing
                ? description
                : { ...description, value: sanitizeDescriptionHtml(description?.value) }
            }
          />
        )
      }
    >
      {isEditing && hasUnsafeDescriptionLink(description?.value) && (
        <span className="is-empty-hint">
          A link has a destination that is not allowed and will not work on the published page
        </span>
      )}
      {/* Empty placeholders must not add markup or spacing to the published page. */}
      {(hasComponents || isEditing) && (
        <AppPlaceholder
          page={page}
          componentMap={componentMap}
          name={placeholderName}
          rendering={rendering}
        />
      )}
    </ContentSection>
  );
};
