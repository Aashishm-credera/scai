import { JSX } from 'react';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import type { PageFullWidthContainerProps } from './page-full-width-container.props';

// Styling is left to FE: only the author's Styles parameter is applied.
export const Default = ({
  params,
  page,
  rendering,
  componentMap,
}: PageFullWidthContainerProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;

  // Dynamic so each container on a page gets its own placeholder.
  const placeholderName = `page-full-width-container-${params.DynamicPlaceholderId}`;
  // Layout data keys the placeholder as `page-full-width-container-{*}` until AppPlaceholder resolves it, so look it
  // up by any key. The container has only this one placeholder.
  const hasComponents = Object.values(rendering.placeholders ?? {}).some(
    (components) => components.length > 0
  );

  // An empty container must not add markup or spacing to the published page.
  if (!hasComponents && !isEditing) {
    return null;
  }

  return (
    <div
      id={params.RenderingIdentifier || undefined}
      className={params.styles?.trim() || undefined}
    >
      <AppPlaceholder
        page={page}
        componentMap={componentMap}
        name={placeholderName}
        rendering={rendering}
      />
    </div>
  );
};
