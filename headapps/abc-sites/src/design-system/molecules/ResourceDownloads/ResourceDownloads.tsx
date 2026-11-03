import { Image, Text } from '@sitecore-content-sdk/nextjs';
import { abcIcon } from '@/design-system/design/icons';
import { cn } from '@/design-system/lib/cn';
import { getFieldValue } from '@/lib/component-props';
import { ResourceDownloadAction } from './ResourceDownloadAction';
import type { ResourceDownloadsProps, ResourceDownloadItem } from './resource-downloads.props';
import './ResourceDownloads.css';

/** Editable, content-driven Resource Downloads banner from the Sitecore datasource. */
export function ResourceDownloads({
  fields,
  isEditing = false,
  id,
  className,
}: ResourceDownloadsProps) {
  const datasource = fields?.data?.datasource;
  if (!datasource)
    return isEditing ? (
      <div className="is-empty-hint">Resource Downloads: assign a datasource.</div>
    ) : null;

  const title = getFieldValue(datasource.title);
  const description = getFieldValue(datasource.description);
  const image = getFieldValue(datasource.image);
  const downloads = datasource.downloads;
  const items: readonly ResourceDownloadItem[] = Array.isArray(downloads)
    ? downloads
    : (downloads as { results?: readonly ResourceDownloadItem[] } | undefined)?.results || [];
  const options = (items || []).map((item) => {
    const file = getFieldValue(item.file);
    return {
      id: item.id,
      href: file?.value?.href || '',
      label: getFieldValue(item.label)?.value || file?.value?.text || '',
      filename: getFieldValue(item.filename)?.value,
    };
  });

  return (
    <section id={id} className={cn('resource-downloads', className)}>
      <div className="resource-downloads-content">
        <div className="resource-downloads-wrapper">
          <div className="resource-downloads-artwork" aria-hidden="true">
            {image?.value?.src || (isEditing && image) ? (
              <Image field={image} alt="" className="resource-downloads-image" />
            ) : (
              <abcIcon name="pictoral/download-document" size="xl" aria-hidden="true" />
            )}
          </div>
          <div className="resource-downloads-text">
            {(title?.value || isEditing) && (
              <Text tag="h2" field={title} className="resource-downloads-title" />
            )}
            {(description?.value || isEditing) && (
              <Text tag="p" field={description} className="resource-downloads-description" />
            )}
          </div>
        </div>
        <ResourceDownloadAction
          options={options}
          label={getFieldValue(datasource.ctaLabel)?.value || 'Download PDF'}
          ariaLabel={getFieldValue(datasource.ctaAriaLabel)?.value}
          navigationLabel={getFieldValue(datasource.navigationLabel)?.value}
          errorMessage={getFieldValue(datasource.errorMessage)?.value}
          downloadingMessage={getFieldValue(datasource.downloadingMessage)?.value}
          downloadedMessage={getFieldValue(datasource.downloadedMessage)?.value}
          isEditing={isEditing}
        />
      </div>
    </section>
  );
}
