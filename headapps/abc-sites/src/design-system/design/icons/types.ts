import type { CSSProperties, HTMLAttributes } from 'react';
import type { iconData } from './icon-data.generated';

export const iconCategories = ['miscellaneous', 'pictoral', 'interface'] as const;

export type IconCategory = (typeof iconCategories)[number];
export type IconColorMode = 'monochrome' | 'multicolor';
export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export const iconColors = [
  'default',
  'brand-primary',
  'brand-secondary',
  'disabled',
  'inverse',
] as const;
export type IconColor = (typeof iconColors)[number];

/** Exact union of the icon IDs approved in the source Figma library. */
export type IconName = (typeof iconData)[number][0];

export type IconDefinition = {
  readonly id: IconName;
  readonly name: string;
  readonly category: IconCategory;
  readonly group: string;
  readonly sourceCategory: 'Icon - Miscellaneous' | 'Icon - pictoral' | 'Icon - Interface';
  readonly width: number;
  readonly height: number;
  readonly colorMode: IconColorMode;
  readonly assetPath: `/icons/${string}.svg`;
};

export type abcIconProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> & {
  /** An allowlisted registry key such as `interface/general/search-lg`. */
  name: IconName;
  /** Responsive abc design-token size. Defaults to the Figma-standard 24px `lg`. */
  size?: IconSize;
  /** A semantic foreground color for monochrome icons. */
  color?: IconColor;
  /** Additional inline styles. */
  style?: CSSProperties;
};
