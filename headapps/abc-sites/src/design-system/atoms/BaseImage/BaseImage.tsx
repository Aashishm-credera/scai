import type { ReactNode } from 'react';
import { BaseTooltip } from '@/design-system/atoms/BaseTooltip';
import { abcIcon } from '@/design-system/design/icons';
import { cn } from '@/design-system/lib/cn';
import {
  ALIGNMENT_LAYOUT,
  alignmentClass,
  aspectRatioClasses,
  type ImageAlignment,
  type ImageAspectRatio,
} from './image-layout';

/**
 * The Base Images design (user story 238218): image, image with tooltip, image with caption and
 * image with caption full width. Caption and tooltip are data-driven, each appears when given and
 * is absent when not.
 *
 * `image` and `caption` are slots rather than a `src` and a string, so the caller decides what
 * renders them. The Sitecore rendering passes the SDK's field components, which is what keeps them
 * editable in Pages; anything else can pass a plain `<img>` or `next/image`. The frame sizes and
 * crops whatever `<img>` it is given.
 *
 * Accessibility: `<figure>` puts the image before the `<figcaption>` in reading order, so screen
 * readers announce the alt text first and the caption second, as the AC requires. Nothing is
 * wired up with aria-describedby, which would read the caption twice.
 */
export type BaseImageProps = {
  /** The `<img>`. With an aspect ratio it is cropped to fill the frame, so render it `fill`. */
  image: ReactNode;
  caption?: ReactNode;
  /** The info icon only renders when this has a value. */
  tooltipText?: string;
  /** Leave unset for "free form": the image keeps its own shape, uncropped. */
  aspectRatio?: ImageAspectRatio;
  /** Where the image sits in its container. Full width when unset. */
  align?: ImageAlignment;
  /** Container width, with block padding. For an image used as its own section. */
  fullWidth?: boolean;
  id?: string;
  className?: string;
  /** Rendered between the image and the caption, e.g. editing controls. */
  children?: ReactNode;
};

// English only until the design system receives localized message files.
const INFO_LABEL = 'Image information';

/**
 * The info button that sits on the image. Its look is specific to images: a translucent surface
 * with a backdrop blur, so it stays legible over any photo. The Tooltip it opens is the shared
 * atom.
 *
 * The blur is half the token. Figma stores blur as a radius twice the CSS `blur()` value, which is
 * why its Inspect panel shows blur(8px) for the 16px backdrop-blur-md token.
 */
function ImageInfo({ text }: { text: string }) {
  return (
    <BaseTooltip title={text}>
      <button
        type="button"
        aria-label={INFO_LABEL}
        className="absolute right-2.5 bottom-2.5 flex size-abc-size-xs items-center justify-center rounded-abc-radius-pill bg-abc-surface-default-transparent backdrop-blur-[calc(var(--abc-backdrop-blurs-backdrop-blur-md-0-blur)/2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-abc-border-focus"
      >
        <abcIcon name="interface/general/info-circle" size="md" color="inverse" />
      </button>
    </BaseTooltip>
  );
}

// `[&_img]` rather than `[&>img]`: in Pages the SDK wraps the <img> in its editing markup.
const CROPPED = '[&_img]:absolute [&_img]:inset-0 [&_img]:size-full [&_img]:object-cover';
const FREE_FORM = '[&_img]:h-auto [&_img]:w-full';

export function BaseImage({
  image,
  caption,
  tooltipText,
  aspectRatio,
  align = 'full',
  fullWidth,
  id,
  className,
  children,
}: BaseImageProps) {
  return (
    <figure
      id={id}
      className={cn(
        'grid gap-abc-spacing-gap-xs',
        ALIGNMENT_LAYOUT,
        alignmentClass(align),
        fullWidth && 'w-full py-abc-spacing-inset-xl',
        className
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-abc-radius-md',
          aspectRatio ? [aspectRatioClasses(aspectRatio), CROPPED] : FREE_FORM
        )}
      >
        {image}
        {tooltipText && <ImageInfo text={tooltipText} />}
      </div>

      {children}

      {caption && (
        <figcaption className="text-body-xs text-pretty text-abc-text-default-quaternary">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
