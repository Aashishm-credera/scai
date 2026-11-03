import type { JSX } from 'react';
import { NextImage, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { useTranslations } from 'next-intl';
import { GuideHeader } from '@/design-system/organisms/GuideHeader';
import type { GuideHeaderStatus } from '@/design-system/organisms/GuideHeader';
import { ParallaxBackdrop } from '@/design-system/atoms/ParallaxBackdrop';
import { SitecoreIcon } from '@/design-system/design/icons';
import { toBreadcrumbItems } from '@/components/foundation/breadcrumb/breadcrumb-items';
import { getIconName } from '@/components/foundation/icon/icon-field';
import { getFocalPointStyle, getImageAlt } from '@/components/foundation/image/image-field';
import { getFieldValue } from '@/lib/component-props';
import type { GuideHeaderFields, GuideHeaderProps } from './guide-header.props';

const UPDATED_KEY = 'updated';

const textOf = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const formatGuideStatusDate = (value: unknown, locale?: string): string | undefined => {
  const source = textOf(value);
  if (!source) return undefined;

  const date = new Date(source);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() <= 1) return undefined;

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const toStatus = (
  datasource: GuideHeaderFields,
  locale?: string
): GuideHeaderStatus | undefined => {
  const tag = datasource.StatusTag?.targetItem;
  // Status Tags are shared sitewide; render their value as plain text, not an editable Sitecore field.
  const label = textOf(getFieldValue(tag?.Text)?.value);
  const date = formatGuideStatusDate(getFieldValue(datasource.StatusDate)?.value, locale);
  if (!label && !date) return undefined;

  const iconName = getIconName(tag?.Icon?.targetItem);

  return {
    label: label || undefined,
    date,
    icon: iconName ? <SitecoreIcon name={iconName} fallback={null} size="sm" /> : undefined,
  };
};

export const Default = ({
  fields,
  params,
  page,
  rendering,
}: GuideHeaderProps): JSX.Element | null => {
  // The dictionary is namespaced by site in src/i18n/request.ts.
  const t = useTranslations(page.siteName);
  const isEditing = page.mode.isEditing;
  const datasource = fields?.data?.datasource;
  const locale = page.layout.sitecore.context.language;

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Guide Header Datasource</span>
    ) : null;
  }

  const imageField = getFieldValue(datasource.BackgroundImage);
  const focalPointX = getFieldValue(datasource.FocalPointX);
  const focalPointY = getFieldValue(datasource.FocalPointY);
  const hasImage = Boolean(imageField?.value?.src);
  const title = getFieldValue(datasource.Title);
  const description = getFieldValue(datasource.Description);
  const hasTitle = Boolean(textOf(title?.value));
  const hasDescription = Boolean(textOf(description?.value));

  // The title is the page's h1; without it there is no header to show.
  if (!hasTitle && !isEditing) {
    return null;
  }

  // Figma backdrop heights have no matching size tokens.
  return (
    <>
      <GuideHeader
        id={params.RenderingIdentifier || undefined}
        className={params.styles?.trim() || undefined}
        metadata={{
          uid: rendering.uid,
          componentName: rendering.componentName,
          dataSource: rendering.dataSource,
        }}
        image={
          hasImage ? (
            <ParallaxBackdrop
              className="h-[482px] w-full flex-none md:h-[622px] lg:absolute lg:inset-0 lg:h-[744px]"
              image={
                <NextImage
                  field={imageField}
                  alt={getImageAlt(imageField)}
                  fill
                  sizes="100vw"
                  style={{
                    ...getFocalPointStyle(focalPointX, focalPointY),
                    objectFit: 'cover',
                  }}
                />
              }
            />
          ) : undefined
        }
        // Empty fields still render in Page Builder so authors can fill them in.
        title={<Text field={title} />}
        description={hasDescription || isEditing ? <RichText field={description} /> : undefined}
        status={toStatus(datasource, locale)}
        updatedLabel={t.has(UPDATED_KEY) ? t(UPDATED_KEY) : undefined}
        breadcrumbItems={toBreadcrumbItems(
          fields?.data?.contextItem?.ancestors,
          page.layout.sitecore.context.language
        )}
      />
      {isEditing && !hasImage && (
        <span className="is-empty-hint">Select a Background Image in the Guide Header fields</span>
      )}
    </>
  );
};
