export interface ResourceDownloadOption {
  id: string;
  label: string;
  href: string;
  filename?: string;
}

export interface ResourceDownloadActionProps {
  options: readonly ResourceDownloadOption[];
  label: string;
  ariaLabel?: string;
  navigationLabel?: string;
  errorMessage?: string;
  downloadingMessage?: string;
  downloadedMessage?: string;
  isEditing?: boolean;
}
