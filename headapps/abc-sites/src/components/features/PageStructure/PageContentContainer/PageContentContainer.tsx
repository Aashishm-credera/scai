import { JSX } from 'react';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import { BaseContainer } from '@/design-system/atoms/BaseContainer';
import type { PageContentContainerProps } from './page-content-container.props';

// The outer div carries the author's Styles and spans the page, so a background style does too.
// The content sits in the Figma container: 1280px with the page margins. Page Full Width Container
// is the same without the container.
export const Default = ({
  params,
  page,
  rendering,
  componentMap,
}: PageContentContainerProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;

  // Dynamic so each container on a page gets its own placeholder.
  const placeholderName = `page-content-container-${params.DynamicPlaceholderId}`;
  // Layout data keys the placeholder as `page-content-container-{*}` until AppPlaceholder resolves it, so look it
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
      <BaseContainer>
        <AppPlaceholder
          page={page}
          componentMap={componentMap}
          name={placeholderName}
          rendering={rendering}
        />
      </BaseContainer>
    </div>
  );
};
