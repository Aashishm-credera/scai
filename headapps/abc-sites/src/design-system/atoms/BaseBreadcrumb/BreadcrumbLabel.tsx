'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/design-system/lib/cn';
import { BaseTooltip } from '@/design-system/atoms/BaseTooltip';
import { Button } from '@/design-system/atoms/BaseButton';
import type { BreadcrumbLabelProps } from './base-breadcrumb.props';

function getPlainText(label: ReactNode) {
  return typeof label === 'string' || typeof label === 'number' ? String(label) : undefined;
}

function useIsTruncated(enabled: boolean) {
  const [isTruncated, setIsTruncated] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);
  const labelRef = useCallback(
    (element: HTMLSpanElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!element || !enabled) return;

      const label = element.querySelector('a') ?? element;
      const measure = () => setIsTruncated(label.scrollWidth > label.clientWidth);
      measure();

      if (typeof ResizeObserver !== 'undefined') {
        observerRef.current = new ResizeObserver(measure);
        observerRef.current.observe(label);
      }
    },
    [enabled]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { isTruncated, labelRef };
}

export function BreadcrumbLabel({ isLastItem, item, truncate }: BreadcrumbLabelProps) {
  const title = item.title ?? item.url;
  const tooltipTitle = item.tooltipLabel ?? getPlainText(title);
  const { isTruncated, labelRef } = useIsTruncated(truncate && Boolean(tooltipTitle));
  const showTooltip = truncate && isTruncated && Boolean(tooltipTitle);
  const className = cn(
    'breadcrumb-link flex w-full min-w-0 max-w-full',
    // Target the shared Button locally so its defaults retain the breadcrumb treatment.
    '[&>.link-button]:flex [&>.link-button]:min-w-0 [&>.link-button]:min-h-0 [&>.link-button]:max-w-full',
    '[&>.link-button]:items-center [&>.link-button]:justify-center',
    '[&>.link-button]:rounded-(--abc-radius-md) [&>.link-button]:bg-transparent',
    '[&>.link-button]:py-(--abc-spacing-inset-xs) [&>.link-button]:px-(--abc-spacing-inset-sm)',
    '[&>.link-button]:font-(family-name:--abc-font-family-body) [&>.link-button]:text-(length:--abc-font-size-text-sm)',
    '[&>.link-button]:font-medium [&>.link-button]:leading-(--abc-font-line-height-text-sm) [&>.link-button]:no-underline',
    '[&>.link-button:hover]:bg-(--abc-surface-default-primary-hover)',
    '[&>.link-button:active]:bg-(--abc-surface-default-primary-hover)',
    '[&>.link-button:focus-visible]:bg-(--abc-surface-default-primary-hover)',
    '[&>.link-button:focus-visible]:text-(--abc-color-neutral-600)',
    '[&>.link-button:focus-visible]:shadow-[0_0_0_2px_var(--abc-surface-default-primary)]',
    '[&>.link-button:focus-visible]:outline-2 [&>.link-button:focus-visible]:outline-offset-2',
    '[&>.link-button:focus-visible]:outline-(--abc-border-focus)',
    'forced-colors:[&>.link-button:focus-visible]:outline-[Highlight]',
    isLastItem
      ? 'breadcrumb-parent [&>.link-button]:text-(--abc-text-default-primary) [&>.link-button:hover]:text-(--abc-text-default-primary) [&>.link-button:active]:text-(--abc-text-default-primary)'
      : '[&>.link-button]:text-(--abc-text-default-quaternary) [&>.link-button:hover]:text-(--abc-text-default-tertiary-hover) [&>.link-button:active]:text-(--abc-text-default-tertiary-hover)',
    truncate &&
      'breadcrumb-truncate [&>.link-button]:block [&>.link-button]:w-full [&>.link-button]:truncate [&>.link-button]:text-start'
  );
  const element = item.url ? (
    <span ref={labelRef} className={className}>
      <Button
        variant="link"
        link={{
          url: item.url,
          title: getPlainText(title) ?? tooltipTitle ?? item.url,
        }}
      />
    </span>
  ) : (
    <span
      aria-label={item.tooltipLabel}
      className={[
        className,
        'breadcrumb-text min-h-0 items-center justify-center rounded-(--abc-radius-md) bg-transparent',
        'py-(--abc-spacing-inset-xs) px-(--abc-spacing-inset-sm)',
        'text-body-sm no-underline',
        isLastItem ? 'text-(--abc-text-default-primary)' : 'text-(--abc-text-default-quaternary)',
      ].join(' ')}
    >
      <span
        ref={labelRef}
        data-breadcrumb-label=""
        className={cn(
          'breadcrumb-label block min-w-0 whitespace-nowrap',
          truncate && 'breadcrumb-label-truncate overflow-hidden text-ellipsis'
        )}
      >
        {title}
      </span>
    </span>
  );

  return showTooltip && tooltipTitle ? (
    <BaseTooltip title={tooltipTitle}>{element}</BaseTooltip>
  ) : (
    element
  );
}
