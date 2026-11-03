/**
 * Aspect ratios follow the Base Images acceptance criteria: 5:4, 3:2, 16:9 and 4:5 from 480px
 * up, but only 5:4 and 4:5 below 480px. So the two landscape ratios fall back to 5:4 on mobile.
 * Figma's note says 16:9 "will mostly be 3:2" on mobile, which the AC does not allow; the AC is
 * the contract, so it wins until design and product agree otherwise.
 *
 * A finite map in source, so Tailwind's scanner sees every class it can produce.
 */
export const IMAGE_ASPECT_RATIOS = ['5:4', '4:5', '3:2', '16:9'] as const;

export type ImageAspectRatio = (typeof IMAGE_ASPECT_RATIOS)[number];

const ASPECT_RATIO_CLASSES: Record<ImageAspectRatio, string> = {
  '5:4': 'aspect-5/4',
  '4:5': 'aspect-4/5',
  '3:2': 'aspect-5/4 md:aspect-3/2',
  '16:9': 'aspect-5/4 md:aspect-16/9',
};

export const aspectRatioClasses = (value: ImageAspectRatio): string => ASPECT_RATIO_CLASSES[value];

export const isImageAspectRatio = (value: unknown): value is ImageAspectRatio =>
  IMAGE_ASPECT_RATIOS.some((ratio) => ratio === value);

/**
 * Image Alignment, the style authors pick on the Image rendering (user story 241949). Full spans
 * the container and is the default. Left, right and center take half the container from 1024px
 * up and sit on that side; below 1024px half would be too small to read, so they span it too.
 *
 * The layout keys off the `image-align-*` class rather than being chosen in JavaScript. When an
 * author changes a style in Page Builder, Pages swaps that class on the rendering's root without
 * re-rendering it, so the class alone has to carry the layout, as `.button-icon-right` does.
 */
export const IMAGE_ALIGNMENTS = ['full', 'left', 'right', 'center'] as const;

export type ImageAlignment = (typeof IMAGE_ALIGNMENTS)[number];

export const ALIGNMENT_LAYOUT =
  'w-full lg:[&.image-align-left]:w-1/2 lg:[&.image-align-left]:mr-auto lg:[&.image-align-right]:w-1/2 lg:[&.image-align-right]:ml-auto lg:[&.image-align-center]:w-1/2 lg:[&.image-align-center]:mx-auto';

export const alignmentClass = (value: ImageAlignment): string => `image-align-${value}`;

/**
 * The `sizes` hint that lets the browser pick the right width from the image's srcset.
 *
 * Content is capped at 1280px from a 1408px viewport up (1280 plus two 64px page margins), and
 * spans the viewport below that. An image inside a narrower column is over-estimated, which costs
 * bytes but never sharpness. Pass a tighter `sizes` where the column width is known.
 */
export const IMAGE_SIZES = '(min-width: 1408px) 1280px, 100vw';
