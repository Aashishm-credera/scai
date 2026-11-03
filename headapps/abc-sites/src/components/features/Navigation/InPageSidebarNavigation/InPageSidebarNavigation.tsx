import { JSX } from 'react';
import { AppPlaceholder, RichText } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';
import { useTranslations } from 'next-intl';
import {
  InPageSidebarNavigation,
  InPageSidebarNavigationLayout,
} from '@/design-system/organisms/InPageSidebarNavigation';
import { getContentSectionHeadingId } from '@/components/foundation/content-section/content-section';
import type { ContentSectionFields } from '@/components/foundation/content-section/content-section';
import { sanitizeHeadingHtml } from '@/components/foundation/heading/heading-field';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { CompatibleDatasource } from '@/lib/component-props';
import type {
  InPageSidebarNavigationProps,
  InPageSidebarNavItem,
} from './in-page-sidebar-navigation.props';

const IN_THIS_GUIDE_KEY = 'inThisGuide';
const CONTENT_SECTION = 'ContentSection';

/**
 * One link per Content Section in the right column, in page order. Their fields come with the
 * layout data, so SubText is available although Content Section never renders it. Sections without
 * a heading are skipped because Content Section renders no heading to link to.
 */
const toNavItems = (components: ComponentRendering[]): InPageSidebarNavItem[] =>
  components.flatMap((component) => {
    if (component.componentName !== CONTENT_SECTION) return [];

    const datasource = getDatasource(
      component.fields as CompatibleDatasource<ContentSectionFields> | undefined
    );
    const heading = getFieldValue(datasource?.Heading)?.value;
    const id = getContentSectionHeadingId(component.params, heading, component.uid);
    const label = sanitizeHeadingHtml(heading);
    if (!id || !label) return [];

    const subText = getFieldValue(datasource?.SubText)?.value?.trim();
    return [{ id, label, subText: subText || undefined }];
  });

export const Default = ({
  params,
  page,
  rendering,
  componentMap,
}: InPageSidebarNavigationProps): JSX.Element | null => {
  // The dictionary is namespaced by site in src/i18n/request.ts.
  const t = useTranslations(page.siteName);
  const isEditing = page.mode.isEditing;

  // Dynamic so each sidebar on a page gets its own placeholder.
  const placeholderName = `in-page-sidebar-navigation-${params.DynamicPlaceholderId}`;
  // Layout data keys the placeholder as `in-page-sidebar-navigation-{*}` until AppPlaceholder
  // resolves it to placeholderName, so read it by any key. The sidebar has only this one placeholder.
  const components = Object.values(rendering.placeholders ?? {}).flat();

  // An empty sidebar must not add markup or spacing to the published page.
  if (components.length === 0 && !isEditing) {
    return null;
  }

  const items = toNavItems(components);
  const title = t.has(IN_THIS_GUIDE_KEY) ? t(IN_THIS_GUIDE_KEY) : undefined;
  const titleId = rendering.uid ? `sidebar-title-${rendering.uid}` : undefined;

  return (
    <div
      id={params.RenderingIdentifier || undefined}
      className={params.styles?.trim() || undefined}
    >
      <InPageSidebarNavigationLayout
        navigation={
          <>
            {isEditing && !title && (
              <span className="is-empty-hint">Missing dictionary phrase: {IN_THIS_GUIDE_KEY}</span>
            )}
            {items.length > 0 ? (
              <InPageSidebarNavigation
                isEditing={isEditing}
                title={title}
                titleId={titleId}
                items={items.map((item) => ({
                  ...item,
                  // No field metadata, so Page Builder shows the label read-only.
                  label: <RichText tag="span" field={{ value: item.label }} />,
                }))}
              />
            ) : (
              isEditing && (
                <span className="is-empty-hint">
                  Add a Content Section with a heading to build the navigation
                </span>
              )
            )}
          </>
        }
      >
        <AppPlaceholder
          page={page}
          componentMap={componentMap}
          name={placeholderName}
          rendering={rendering}
        />
      </InPageSidebarNavigationLayout>
    </div>
  );
};
