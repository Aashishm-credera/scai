import { useId } from 'react';
import { BaseBreadcrumb } from '@/design-system/atoms/BaseBreadcrumb';
import { cn } from '@/design-system/lib/cn';
import type { GuideHeaderProps } from './guide-header.types';

export function GuideHeader({
  id,
  className,
  metadata,
  image,
  title,
  description,
  status,
  breadcrumbItems,
  updatedLabel,
}: GuideHeaderProps) {
  const headingId = useId();
  if (!image && !title && !description) return null;

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        'relative flex w-full min-w-0 flex-col overflow-clip text-(--abc-text-default-primary) lg:block lg:h-[744px]',
        className
      )}
      data-rendering-uid={metadata?.uid}
      data-rendering-component={metadata?.componentName}
      data-rendering-datasource={metadata?.dataSource}
    >
      {image}

      <div
        className="hidden lg:absolute lg:bottom-0 lg:left-0 lg:block lg:h-(--abc-size-md) lg:w-full lg:rounded-t-(--abc-radius-4xl) lg:bg-(--abc-surface-default-primary)"
        aria-hidden="true"
      />

      {/* Figma dimensions and overlaps have no matching spacing or size tokens. */}
      <div className="relative z-10 -mt-[77px] flex w-full min-w-0 flex-col overflow-hidden rounded-t-(--abc-radius-4xl) border-b border-(--abc-border-default-secondary) bg-(--abc-surface-default-primary) md:-mt-[30px] lg:absolute lg:bottom-24 lg:left-(--abc-layout-container-page-margin-inline) lg:m-0 lg:w-[565px] lg:rounded-(--abc-radius-3xl) lg:border-0 lg:shadow-abc-elevation-high-neutral xl:w-[602px]">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <div className="flex min-w-0 items-center overflow-x-auto border-b border-(--abc-border-default-secondary) px-(--abc-layout-container-page-margin-inline) py-(--abc-spacing-inset-lg) lg:px-(--abc-spacing-inset-5xl)">
            <BaseBreadcrumb breadcrumbItems={breadcrumbItems} />
          </div>
        )}

        <div className="flex min-w-0 flex-col items-start gap-(--abc-spacing-inset-3xl) px-(--abc-layout-container-page-margin-inline) pt-(--abc-spacing-inset-xl) pb-(--abc-spacing-inset-6xl) lg:gap-(--abc-spacing-inset-3xl) lg:px-(--abc-spacing-inset-5xl) lg:pt-(--abc-spacing-inset-xl) lg:pb-(--abc-spacing-inset-4xl)">
          <div className="flex w-full min-w-0 flex-col gap-(--abc-spacing-gap-xl)">
            {/* Figma letter spacing has no matching typography token. */}
            {title && (
              <h1
                id={headingId}
                className="w-full min-w-0 wrap-anywhere text-display-sm tracking-[-0.02em] uppercase md:text-display-md lg:text-display-lg"
              >
                {title}
              </h1>
            )}
            {description && (
              <div className="w-full min-w-0 wrap-anywhere text-body-md text-pretty md:text-body-lg">
                {description}
              </div>
            )}
          </div>

          {status && (
            <div className="flex max-w-full flex-wrap items-center gap-(--abc-spacing-gap-sm) rounded-(--abc-radius-pill) bg-(--abc-feedback-success-bg-primary) py-(--abc-spacing-inset-xs) ps-(--abc-spacing-inset-sm) pe-(--abc-spacing-inset-md) text-(--abc-feedback-success-text-primary) text-body-sm wrap-anywhere lg:min-h-8 lg:rounded-(--abc-radius-md)">
              {status.icon && (
                <span className="shrink-0 text-(--abc-feedback-success-icon-primary)">
                  {status.icon}
                </span>
              )}
              <span className="min-w-0 wrap-anywhere">
                {status.label}
                {status.date && (
                  <>
                    {' • '}
                    {updatedLabel && `${updatedLabel} `}
                    {status.date}
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
