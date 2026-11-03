import { JSX } from 'react';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { EmergencyCalloutProps } from './emergency-callout.props';
import { EmergencyCallout, EmergencyCalloutProps as EmergencyCalloutUIProps} from '@/design-system/molecules/EmergencyCallout';
import { getIconName } from '@/components/foundation/icon/icon-field';
import { hasUnsafeDescriptionLink, isDescriptionEmpty, sanitizeDescriptionHtml } from '@/components/foundation/rich-text/description-field';

export const Default = ({ fields, params, page }: EmergencyCalloutProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const id = params.RenderingIdentifier;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Emergency Callout Datasource</span>
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
  
  const emergencyCalloutUIProps: EmergencyCalloutUIProps = {
    id: id,
    Icon: iconName,
    TitleField: titleField,
    DescriptionField: descriptionField,
    styles: params.styles,
    isPageEditing: isEditing
  }

  return (
    <EmergencyCallout {...emergencyCalloutUIProps}/>
  );
};
