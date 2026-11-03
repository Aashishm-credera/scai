import type { ComponentProps, ReactNode } from 'react';
import { SitecoreIcon } from '@/design-system/design/icons';
import { cn } from '@/design-system/lib/cn';
import { TextField } from '@sitecore-content-sdk/nextjs';

export const LABEL_VARIANTS = [
  'neutral',
  'brand',
  'success',
  'warning',
  'error',
  'slate',
  'sky',
  'indigo',
  'purple',
  'blue',
  'pink',
  'orange',
  'green',
] as const;

export type LabelVariant = (typeof LABEL_VARIANTS)[number];

export const isLabelVariant = (value: unknown): value is LabelVariant =>
  typeof value === 'string' && LABEL_VARIANTS.some((variant) => variant === value);

export interface LabelProps extends Omit<ComponentProps<'span'>, 'children'> {
  children: ReactNode;
  icon?: string | null;
  iconPosition?: 'none' | 'left' | 'right';
  variant?: LabelVariant;
}

const VARIANT_CLASSES: Record<LabelVariant, string> = {
  neutral: 'bg-(--abc-accent-surface-neutral) text-(--badge-foreground-neutral)',
  brand: 'bg-(--badge-surface-brand) text-(--badge-foreground-brand)',
  success: 'bg-(--abc-feedback-success-bg-primary) text-(--abc-feedback-success-text-primary)',
  warning: 'bg-(--abc-feedback-warning-bg-primary) text-(--abc-feedback-warning-text-primary)',
  error: 'bg-(--abc-feedback-error-bg-primary) text-(--abc-feedback-error-text-primary)',
  slate: 'bg-(--abc-accent-surface-slate) text-(--badge-foreground-slate)',
  sky: 'bg-(--abc-accent-surface-sky) text-(--badge-foreground-sky)',
  indigo: 'bg-(--abc-accent-surface-indigo) text-(--badge-foreground-indigo)',
  purple: 'bg-(--abc-accent-surface-purple) text-(--badge-foreground-purple)',
  blue: 'bg-(--abc-accent-surface-blue) text-(--badge-foreground-blue)',
  pink: 'bg-(--abc-accent-surface-pink) text-(--badge-foreground-pink)',
  orange: 'bg-(--abc-accent-surface-orange) text-(--badge-foreground-orange)',
  green: 'bg-(--abc-accent-surface-green) text-(--abc-accent-foreground-green)',
};

const VARIANT_ICON_COLORS: Partial<Record<LabelVariant, string>> = {
  success: 'var(--abc-feedback-success-icon-primary)',
  warning: 'var(--abc-feedback-warning-icon-primary)',
  error: 'var(--abc-feedback-error-icon-primary)',
};

export function Label({
  children,
  icon,
  iconPosition = 'none',
  variant = 'neutral',
  className,
  ...props
}: LabelProps) {
  const iconColor = VARIANT_ICON_COLORS[variant];
  const labelIcon = icon ? (
    <SitecoreIcon
      name={icon}
      size="sm"
      aria-hidden="true"
      style={iconColor ? { color: iconColor } : undefined}
    />
  ) : null;
  const hasPositionedIcon = Boolean(labelIcon && iconPosition !== 'none');
  const paddingClasses =
    hasPositionedIcon && iconPosition === 'left'
      ? 'ps-(--abc-spacing-inset-sm) pe-(--abc-spacing-inset-md)'
      : hasPositionedIcon && iconPosition === 'right'
        ? 'ps-(--abc-spacing-inset-md) pe-(--abc-spacing-inset-sm)'
        : 'px-(--abc-spacing-inset-md)';

  return (
    <span
      className={cn(
        'inline-flex min-w-0 max-w-full items-center gap-(--abc-spacing-gap-sm) rounded-(--abc-radius-pill) py-(--abc-spacing-inset-xs) font-sans font-bold text-(length:--abc-font-size-label-md) leading-(--abc-font-line-height-label-md)',
        paddingClasses,
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {iconPosition === 'left' && labelIcon}
      <span className="min-w-0 wrap-anywhere">{children}</span>
      {iconPosition === 'right' && labelIcon}
    </span>
  );
}
