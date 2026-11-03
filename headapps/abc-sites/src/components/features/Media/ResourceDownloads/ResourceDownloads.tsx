import { JSX } from 'react';
import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ResourceDownloads } from '@/design-system/molecules/ResourceDownloads';
import type {
  ResourceDownloadItem,
  ResourceDownloadsDatasource,
} from '@/design-system/molecules/ResourceDownloads';
import { isResourceDownloadHref } from '@/design-system/molecules/ResourceDownloads/download-resource';
import { getDatasource, getFieldValue } from 'lib/component-props';
import type { ResourceDownloadFileFields, ResourceDownloadsProps } from './resource-downloads.props';

const textOf = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** A Checkbox field arrives as a boolean, or as "1" from some serializers. */
const isChecked = (field: Field<boolean | string> | undefined): boolean =>
  field?.value === true || field?.value === '1';

/**
 * A download option for the molecule, or nothing when the file is missing or not an http(s) URL.
 * The label falls back to the media item's Title, then the item name.
 */
const toDownloadItem = (item: ResourceDownloadFileFields): ResourceDownloadItem[] => {
  const file = getFieldValue(item.File)?.value;
  const href = textOf(file?.src);
  if (!file || !isResourceDownloadHref(href)) return [];

  const label =
    textOf(getFieldValue(item.Label)?.value) ||
    textOf(file.title) ||
    textOf(file.displayName) ||
    textOf(item.name);

  return [
    {
      id: item.id,
      label: { value: label },
      file: { value: { href, text: label } },
    },
  ];
};

/**
 * The Thumbnail Image wins over Use Download Icon; without either the molecule shows the download
 * icon. Page Builder keeps the empty field unless the icon is chosen, so authors can add an image.
 */
const resolveArtwork = (
  image: ImageField | undefined,
  useDownloadIcon: boolean,
  isEditing: boolean
): ImageField | undefined => {
  if (textOf(image?.value?.src)) return image;
  if (isEditing && !useDownloadIcon) return image;
  return undefined;
};

export const Default = ({ fields, params, page }: ResourceDownloadsProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Resource Downloads Datasource</span>
    ) : null;
  }

  const title = getFieldValue(datasource.Title);
  const downloads = (datasource.children?.results ?? []).flatMap((item) =>
    item?.id ? toDownloadItem(item) : []
  );

  // A title and at least one PDF are required on the published page.
  if (!isEditing && (!textOf(title?.value) || downloads.length === 0)) {
    return null;
  }

  const molecule: ResourceDownloadsDatasource = {
    title,
    description: getFieldValue(datasource.Description),
    image: resolveArtwork(
      getFieldValue(datasource.ThumbnailImage),
      isChecked(getFieldValue(datasource.UseDownloadIcon)),
      isEditing
    ),
    ctaLabel: getFieldValue(datasource.ButtonText),
    ctaAriaLabel: getFieldValue(datasource.AriaLabel),
    downloads,
  };

  return (
    <>
      <ResourceDownloads
        fields={{ data: { datasource: molecule } }}
        isEditing={isEditing}
        id={params.RenderingIdentifier || undefined}
        className={params.styles?.trim() || undefined}
      />
      {isEditing && downloads.length === 0 && (
        <span className="is-empty-hint">Add a Resource Download File with a PDF</span>
      )}
    </>
  );
};
