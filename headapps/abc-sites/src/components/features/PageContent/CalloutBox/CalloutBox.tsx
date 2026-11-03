import type { JSX } from 'react';
import { getDatasource, getFieldValue } from 'lib/component-props';
import { CalloutBoxProps } from './callout-box.props';
import { getIconName } from '@/components/foundation/icon/icon-field';
import { hasUnsafeDescriptionLink, isDescriptionEmpty, sanitizeDescriptionHtml } from '@/components/foundation/rich-text/description-field';
import { CalloutBox, CalloutBoxUIProps } from '@/design-system/molecules/CalloutBox';

export const Default = ({fields, page, params}: CalloutBoxProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const id = params.RenderingIdentifier;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Callout Box Datasource</span>
    ) : null;
  }

  // Validate and sanitize field values. Return null if invalid.
  // Icon field
  const iconName = getIconName(getFieldValue(datasource?.Icon));
  
  // Description Field
  const df = getFieldValue(datasource.Description); 
  const description = df?.value;
  const descriptionField = isEditing ? df 
    : (!isDescriptionEmpty(description) && !hasUnsafeDescriptionLink(description)) 
      ? {...df, value: sanitizeDescriptionHtml(description)}
       : null;
  
  // Title Field
  const titleField = getFieldValue(datasource?.Title);

  // Link Field
  const linkField = getFieldValue(datasource?.Link);

  const callOutBoxUiProps: CalloutBoxUIProps = {
    id: id,
    Icon: iconName,
    LinkField: linkField,
    TitleField: titleField,
    DescriptionField: descriptionField,
    styles: params.styles,
    isPageEditing: isEditing
  }

  return (
    <CalloutBox {...callOutBoxUiProps}/>
  );
};

