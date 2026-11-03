import type { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from 'lib/component-props';
import type { TooltipFields } from 'components/foundation/tooltip/tooltip.props';

/** TooltipTitle is not rendered yet: the BaseImage atom only shows the tooltip text. */
export interface BaseImageFields extends TooltipFields {
  Image?: CompatibleField<ImageField>;
  Caption?: CompatibleField<RichTextField>;
  /** 0–100 %, empty means centered. */
  FocalPointX?: CompatibleField<Field<string | number>>;
  /** 0–100 %, empty means centered. */
  FocalPointY?: CompatibleField<Field<string | number>>;
}

export interface BaseImageParams {
  /** Droplist of Aspect Ratio setting item names, e.g. `16x9`. Empty means free form. */
  AspectRatio?: string;
}

export interface BaseImageProps extends ComponentProps {
  params: ComponentProps['params'] & BaseImageParams;
  fields?: CompatibleDatasource<BaseImageFields>;
}
