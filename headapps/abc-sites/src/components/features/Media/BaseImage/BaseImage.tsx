import { JSX } from 'react';
import { NextImage, RichText } from '@sitecore-content-sdk/nextjs';
import { BaseImage as BaseImageFrame, IMAGE_SIZES } from '@/design-system/atoms/BaseImage';
import { cn } from '@/design-system/lib/cn';
import {
  getFocalPointStyle,
  getImageAlt,
  toImageAspectRatio,
} from '@/components/foundation/image/image-field';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { BaseImageProps } from './base-image.props';

export const Default = ({ fields, params, page }: BaseImageProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? <span className="is-empty-hint">Image</span> : null;
  }

  const image = getFieldValue(datasource.Image);
  const caption = getFieldValue(datasource.Caption);
  // const tooltipTitle = getFieldValue(datasource.TooltipTitle)?.value?.trim();
  const tooltipText = getFieldValue(datasource.TooltipText)?.value?.trim();
  const hasImage = Boolean(image?.value?.src);
  const hasCaption = Boolean(caption?.value);

  // Empty fields still render in Page Builder so authors can fill them in.
  if (!hasImage && !isEditing) {
    return null;
  }

  // The Image Alignment style arrives in params.styles as an image-align-* class, which styles
  // itself. Passing it as `align` instead would freeze it until Pages re-renders the component.
  return (
    <BaseImageFrame
      id={params.RenderingIdentifier || undefined}
      // `component` marks the rendering root, which is where Pages swaps a changed style's class.
      className={cn('component', params.styles)}
      aspectRatio={toImageAspectRatio(params.AspectRatio)}
      tooltipText={tooltipText || undefined}
      image={
        <NextImage
          field={image}
          alt={getImageAlt(image)}
          sizes={IMAGE_SIZES}
          style={getFocalPointStyle(
            getFieldValue(datasource.FocalPointX),
            getFieldValue(datasource.FocalPointY)
          )}
        />
      }
      caption={hasCaption || isEditing ? <RichText field={caption} /> : undefined}
    ></BaseImageFrame>
  );
};
