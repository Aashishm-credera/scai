import { cva } from 'class-variance-authority';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link';

export const BUTTON_VARIANTS = ['primary', 'secondary', 'tertiary', 'link'] as const;

export function isButtonVariant(value: string): value is ButtonVariant {
  return BUTTON_VARIANTS.some((variant) => variant === value);
}

/*
 * Everything is painted on the anchor itself, and the visible label is its only child. Page
 * builder replaces a Link field's children with the new text when an author edits it, so a child
 * element (a surface, an icon, a spinner) would vanish mid-edit. Instead:
 *
 * - ::before is the gradient surface of primary and secondary, and the spinner while loading.
 * - ::after is the icon, drawn from --button-icon-image, which Button sets on the anchor.
 * - data-icon-name and data-icon-color-mode on the anchor turn the icon on and pick a mask
 *   (monochrome, takes the text colour) or a background (multicolor, keeps its own colours).
 *
 * Every class is written out in full, because Tailwind only generates classes it can read in the
 * source. Not run through cn(): tailwind-merge reads `text-label-md` (typography) and
 * `text-(--colour)` as the same utility and drops one. The anchor has no :disabled, so the disabled
 * treatment keys off aria-disabled.
 */
const BASE = [
  'group/button relative isolate inline-flex max-w-full items-center justify-center cursor-pointer no-underline whitespace-normal text-center select-none forced-colors:border',
  // Motion tokens, which already drop to 0ms and linear under prefers-reduced-motion.
  'transition-colors duration-(--abc-transition-control-duration) ease-(--abc-transition-control-easing) motion-reduce:!transition-none',
  'focus-visible:shadow-[0_0_0_var(--abc-space-4)_var(--abc-surface-default-primary)] focus-visible:outline-2 focus-visible:outline-offset-(--abc-space-4) focus-visible:outline-(--abc-border-focus)',
  'aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:text-(--abc-foreground-default-disabled)',
  // Icon. ::after follows the text, so row-reverse puts it on the left unless button-icon-right.
  "[&[data-icon-name]:not(.button-icon-right)]:flex-row-reverse data-[icon-name]:after:inline-block data-[icon-name]:after:shrink-0 data-[icon-name]:after:content-['']",
  'data-[icon-color-mode=monochrome]:after:bg-current data-[icon-color-mode=monochrome]:after:mask-(--button-icon-image) data-[icon-color-mode=monochrome]:after:mask-center data-[icon-color-mode=monochrome]:after:mask-no-repeat data-[icon-color-mode=monochrome]:after:mask-contain',
  'data-[icon-color-mode=multicolor]:after:bg-(image:--button-icon-image) data-[icon-color-mode=multicolor]:after:bg-center data-[icon-color-mode=multicolor]:after:bg-no-repeat data-[icon-color-mode=multicolor]:after:bg-contain',
  // Loading. The label and icon go transparent and ::before becomes the spinner ring.
  "aria-busy:pointer-events-none aria-busy:!text-transparent aria-busy:after:opacity-0 aria-busy:before:!block aria-busy:before:absolute aria-busy:before:inset-0 aria-busy:before:z-1 aria-busy:before:m-auto aria-busy:before:size-(--abc-space-16) aria-busy:before:scale-100 aria-busy:before:animate-spin motion-reduce:before:animate-none aria-busy:before:rounded-full aria-busy:before:border-(length:--abc-space-2) aria-busy:before:bg-none aria-busy:before:shadow-none aria-busy:before:content-['']",
].join(' ');

/**
 * Primary and secondary paint their gradient and elevation on ::before, because Figma grows the
 * surface by the transform token on hover/press while the label and icon stay put.
 */
const SOLID = [
  "before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:content-[''] before:transition-[transform,box-shadow,background-size] before:duration-(--abc-transition-control-duration) before:ease-(--abc-transition-control-easing) motion-reduce:before:!transition-none",
  'hover:before:scale-[var(--abc-transform-hover-scale)] active:before:scale-[var(--abc-transform-hover-scale)] motion-reduce:hover:before:scale-100 motion-reduce:active:before:scale-100 aria-disabled:before:hidden',
  'min-h-(--abc-buttons-height-md) rounded-(--abc-radius-lg) px-(--abc-buttons-padding-x-md) py-(--abc-buttons-padding-y-md) gap-(--abc-spacing-gap-sm) text-label-md',
  'aria-disabled:bg-(--abc-surface-default-disabled) data-[icon-name]:after:size-(--abc-space-20)',
].join(' ');

const NEUTRAL_SPINNER =
  'aria-busy:before:border-(--abc-color-neutral-400)/30 aria-busy:before:border-t-(--abc-color-neutral-400)';

export const buttonVariants = cva(BASE, {
  variants: {
    variant: {
      primary: [
        SOLID,
        'text-(--abc-text-inverse-primary)',
        'before:[background-image:linear-gradient(13deg,var(--abc-color-brand-primary-900),var(--abc-surface-brand-brand-1-hover)_34%,var(--abc-color-brand-primary-400)_75%,var(--abc-color-brand-highlight-500)),linear-gradient(13deg,var(--abc-color-brand-primary-450),var(--abc-surface-brand-brand-1))] before:[background-size:0%_100%,100%_100%]',
        'hover:before:[background-size:100%_100%,100%_100%] active:before:[background-size:100%_100%,100%_100%] hover:before:shadow-abc-elevation-low-brand-hover active:before:shadow-abc-elevation-low-brand-hover',
        // While loading, ::before is the spinner, so the brand surface moves onto the anchor.
        'aria-busy:bg-linear-[13deg,var(--abc-color-brand-primary-450),var(--abc-surface-brand-brand-1)] aria-busy:shadow-abc-elevation-low-brand',
        'aria-busy:before:border-(--abc-text-inverse-primary)/30 aria-busy:before:border-t-(--abc-text-inverse-primary)',
      ].join(' '),
      secondary: [
        SOLID,
        'text-(--abc-text-default-secondary) hover:text-(--abc-text-default-secondary-hover) active:text-(--abc-text-default-secondary-hover)',
        'before:rounded-(--abc-radius-md) before:[background-image:linear-gradient(var(--abc-surface-default-secondary),var(--abc-surface-default-secondary-hover)),linear-gradient(var(--abc-surface-default-primary),var(--abc-surface-default-secondary))] before:[background-size:0%_100%,100%_100%] before:shadow-abc-elevation-low-neutral',
        'hover:before:[background-size:100%_100%,100%_100%] active:before:[background-size:100%_100%,100%_100%] hover:before:shadow-abc-elevation-low-neutral-hover active:before:shadow-abc-elevation-low-neutral-hover',
        'motion-reduce:hover:text-(--abc-text-default-secondary) motion-reduce:active:text-(--abc-text-default-secondary)',
        'aria-[current=page]:text-(--abc-text-inverse-primary) aria-[current=page]:before:bg-linear-[13deg,var(--abc-color-brand-primary-450),var(--abc-surface-brand-brand-1)] aria-[current=page]:before:shadow-abc-elevation-low-brand',
        `aria-busy:bg-(--abc-surface-default-disabled) ${NEUTRAL_SPINNER}`,
      ].join(' '),
      tertiary: [
        'min-h-(--abc-buttons-height-md) rounded-(--abc-radius-10) bg-transparent px-(--abc-buttons-padding-x-flush) py-(--abc-buttons-padding-y-md) gap-(--abc-spacing-gap-sm) text-label-sm',
        'text-(--abc-text-default-tertiary) hover:text-(--abc-text-default-secondary-hover) active:text-(--abc-text-default-secondary-hover) focus-visible:bg-(--abc-surface-default-primary) aria-disabled:bg-transparent',
        `data-[icon-name]:after:size-(--abc-space-20) ${NEUTRAL_SPINNER}`,
      ].join(' '),
      link: [
        'min-h-(--abc-buttons-height-sm) rounded-(--abc-radius-10) bg-transparent px-(--abc-buttons-padding-x-flush) py-(--abc-buttons-padding-y-sm) gap-(--abc-spacing-gap-sm) text-label-xs',
        'text-(--abc-text-default-secondary) hover:text-(--abc-surface-brand-brand-1-secondary-hover) active:text-(--abc-surface-brand-brand-1-secondary-hover) aria-disabled:bg-transparent',
        `data-[icon-name]:after:size-(--abc-icon-size-sm) ${NEUTRAL_SPINNER}`,
      ].join(' '),
    },
  },
  defaultVariants: { variant: 'primary' },
});
