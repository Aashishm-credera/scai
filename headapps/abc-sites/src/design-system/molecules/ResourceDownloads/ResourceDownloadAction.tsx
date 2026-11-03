'use client';

import { useRef, useState } from 'react';
import { ButtonAction } from '@/design-system/atoms/BaseButton';
import { LinkDropdown } from '@/design-system/molecules/LinkDropdown';
import { downloadResource, isResourceDownloadHref } from './download-resource';
import type {
  ResourceDownloadActionProps,
  ResourceDownloadOption,
} from './resource-download-action.props';

/** Chooses a direct download or the shared link dropdown according to the assigned PDFs. */
export function ResourceDownloadAction({
  options,
  label,
  ariaLabel,
  navigationLabel = label,
  isEditing = false,
  errorMessage = 'The PDF could not be downloaded. Please try again.',
  downloadingMessage = 'Downloading PDF…',
  downloadedMessage = 'PDF download started.',
}: ResourceDownloadActionProps) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const downloading = useRef(false);
  const validOptions = options.filter((option) => isResourceDownloadHref(option.href));
  const multiple = validOptions.length > 1;

  async function startDownload(option: ResourceDownloadOption) {
    if (isEditing || downloading.current) return;
    downloading.current = true;
    setBusy(true);
    setStatus(downloadingMessage);
    try {
      await downloadResource(option);
      setStatus(downloadedMessage);
    } catch {
      setStatus(errorMessage);
    } finally {
      downloading.current = false;
      setBusy(false);
    }
  }

  const button = (
    <ButtonAction
      variant="secondary"
      icon={multiple ? 'interface/arrows/chevron-down' : 'interface/general/download-01'}
      styles="button-icon-right"
      className="resource-downloads-cta"
      aria-label={ariaLabel || label}
      aria-busy={busy || undefined}
      disabled={busy || isEditing || !validOptions.length}
      onClick={multiple ? undefined : () => void startDownload(validOptions[0])}
    >
      {label}
    </ButtonAction>
  );

  return (
    <div className="resource-downloads-action">
      {multiple ? (
        <LinkDropdown
          trigger={button}
          triggerLabel={ariaLabel || label}
          navigationLabel={navigationLabel}
          disabled={busy || isEditing}
          items={validOptions.map((option) => ({
            id: option.id,
            label: option.label,
            link: (
              <a
                href={option.href}
                download={option.filename || true}
                onClick={(event) => {
                  event.preventDefault();
                  void startDownload(option);
                }}
              >
                {option.label}
              </a>
            ),
          }))}
        />
      ) : (
        button
      )}
      <span role="status" className="sr-only">
        {status}
      </span>
    </div>
  );
}
