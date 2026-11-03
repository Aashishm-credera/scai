import { JSX } from 'react';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import type { PlaceholderComponentProps } from 'lib/component-props';

const PageMainContentContainer = (props: PlaceholderComponentProps): JSX.Element | null => {
  const { page, componentMap, rendering, params } = props;

  // Dynamic so each container in a partial design or page gets its own placeholder.
  const placeholderName = `abc-page-main-content-${params?.DynamicPlaceholderId}`;
  // Layout data keys the placeholder as `abc-page-main-content-{*}` until AppPlaceholder resolves it, so look it
  // up by any key. The container has only this one placeholder.
  const hasComponents = Object.values(rendering?.placeholders ?? {}).some(
    (components) => components.length > 0
  );

  // Empty placeholders must not add markup or spacing to the published page.
  // In Page Builder the placeholder is always rendered so authors can add components.
  if (!hasComponents && !page.mode.isEditing) {
    return null;
  }

  return (
    <section className={params?.styles?.trim() || undefined} id={params?.RenderingIdentifier}>
      <AppPlaceholder
        page={page}
        componentMap={componentMap}
        name={placeholderName}
        rendering={rendering}
      />
    </section>
  );
};

export default PageMainContentContainer;
