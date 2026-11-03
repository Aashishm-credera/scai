import type { CSSProperties } from 'react';
import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { isImageAspectRatio, type ImageAspectRatio } from '@/design-system/atoms/BaseImage';

/**
 * Helpers that turn Sitecore image data into what the BaseImage design-system atom expects.
 * Shared so every component that renders an image applies the same alt, focal point and aspect
 * ratio rules.
 */

const FOCAL_POINT_DEFAULT = 50;

/** An Integer field arrives as a string or a number; empty or invalid means centered. */
export const toFocalPercent = (field: Field<string | number> | undefined): number => {
  const raw = field?.value;
  if (raw === undefined || raw === null || raw === '') return FOCAL_POINT_DEFAULT;

  const value = Number(raw);
  if (!Number.isFinite(value)) return FOCAL_POINT_DEFAULT;

  return Math.min(100, Math.max(0, value));
};

/** The `object-position` that keeps the focal point in frame when the image is cropped. */
export const getFocalPointStyle = (
  focalPointX: Field<string | number> | undefined,
  focalPointY: Field<string | number> | undefined
): CSSProperties => ({
  objectPosition: `${toFocalPercent(focalPointX)}% ${toFocalPercent(focalPointY)}%`,
});

/**
 * Alt text comes from the media item. When it is empty the image is decorative and gets `alt=""`,
 * so screen readers skip it.
 */
export const getImageAlt = (image: ImageField | undefined): string => {
  const alt = image?.value?.alt;
  return typeof alt === 'string' ? alt.trim() : '';
};

export const isDecorativeImage = (image: ImageField | undefined): boolean => !getImageAlt(image);

/**
 * The Aspect Ratio parameter is a Droplist, so it holds the setting item's name (`16x9`) rather
 * than its value (`16:9`). Anything unrecognised, including empty, means free form.
 */
export const toImageAspectRatio = (value: unknown): ImageAspectRatio | undefined => {
  if (typeof value !== 'string') return undefined;

  const ratio = value.trim().replace(/x/i, ':');
  return isImageAspectRatio(ratio) ? ratio : undefined;
};
