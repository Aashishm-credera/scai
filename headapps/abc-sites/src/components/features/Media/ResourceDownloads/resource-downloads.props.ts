import type { Field, FileField, ImageField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from 'lib/component-props';

/** One child item of the Resource Download File template. */
export interface ResourceDownloadFileFields {
  id: string;
  /** Item name, the last fallback for the list label. */
  name?: string;
  /** File field; its value carries the media item's `src`, `title`, `extension` and `mimeType`. */
  File?: CompatibleField<FileField> | null;
  /** List item text when more than one PDF is assigned. Falls back to the media item's Title. */
  Label?: CompatibleField<Field<string>> | null;
}

export interface ResourceDownloadsFields {
  Title?: CompatibleField<Field<string>> | null;
  Description?: CompatibleField<Field<string>> | null;
  /** Defaults to "Download PDF" through standard values. */
  ButtonText?: CompatibleField<Field<string>> | null;
  /** Overrides the default artwork. PNG or JPG only. */
  ThumbnailImage?: CompatibleField<ImageField> | null;
  /** Shows the download icon; ignored when a Thumbnail Image is set. */
  UseDownloadIcon?: CompatibleField<Field<boolean | string>> | null;
  /** From `_Accessibility Fields`. Replaces the CTA's accessible name when set. */
  AriaLabel?: CompatibleField<Field<string>> | null;
  children?: { results?: Array<ResourceDownloadFileFields | null> | null } | null;
}

export interface ResourceDownloadsProps extends ComponentProps {
  fields?: CompatibleDatasource<ResourceDownloadsFields>;
}
