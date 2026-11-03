import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleField, ComponentProps } from '@/lib/component-props';

export interface ResourceDownloadItem {
  id: string;
  label?: CompatibleField<Field<string>>;
  file?: CompatibleField<LinkField>;
  filename?: CompatibleField<Field<string>>;
}

export interface ResourceDownloadsDatasource {
  title?: CompatibleField<Field<string>>;
  description?: CompatibleField<Field<string>>;
  image?: CompatibleField<ImageField>;
  ctaLabel?: CompatibleField<Field<string>>;
  ctaAriaLabel?: CompatibleField<Field<string>>;
  navigationLabel?: CompatibleField<Field<string>>;
  errorMessage?: CompatibleField<Field<string>>;
  downloadingMessage?: CompatibleField<Field<string>>;
  downloadedMessage?: CompatibleField<Field<string>>;
  downloads?: readonly ResourceDownloadItem[] | { results?: readonly ResourceDownloadItem[] };
}

export interface ResourceDownloadsFields {
  data?: { datasource?: ResourceDownloadsDatasource | null };
}

export interface ResourceDownloadsProps {
  fields?: ResourceDownloadsFields;
  isEditing?: boolean;
  id?: string;
  className?: string;
}

export interface ResourceDownloadsRenderingProps extends ComponentProps {
  fields?: ResourceDownloadsFields;
}
