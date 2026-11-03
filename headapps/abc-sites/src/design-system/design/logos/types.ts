import type { ImageProps } from 'next/image';

export const logoCategories = ['abc', 'partner'] as const;
export const logoSizes = ['sm', 'md', 'lg'] as const;
export const logoVariants = ['default', 'badge'] as const;

export type LogoCategory = (typeof logoCategories)[number];
export type LogoSize = (typeof logoSizes)[number];
export type LogoVariant = (typeof logoVariants)[number];

export type LogoName =
  | 'abc/wordmark'
  | 'abc/symbol'
  | 'abc/logomark'
  | 'partner/bbb-accredited-charity'
  | 'partner/charity-navigator'
  | 'partner/national-health-council'
  | 'partner/sectigo';

export type LogoAsset = {
  readonly assetPath: `/logos/${string}.svg`;
  readonly width: number;
  readonly height: number;
};

export type LogoDefinition = {
  readonly id: LogoName;
  readonly name: string;
  readonly label: string;
  readonly category: LogoCategory;
  readonly sourceName: string;
  readonly variants: readonly LogoVariant[];
  readonly assets: Readonly<Partial<Record<LogoVariant, Readonly<Record<LogoSize, LogoAsset>>>>>;
};

export type abcLogoProps = Omit<ImageProps, 'alt' | 'children' | 'height' | 'src' | 'width'> & {
  /** An allowlisted registry key such as `abc/wordmark`. */
  name: LogoName;
  /** An approved logo size. Defaults to `md`. */
  size?: LogoSize;
  /** Partner badge artwork is intended for dark surfaces. Defaults to `default`. */
  variant?: LogoVariant;
  /** Defaults to the logo's registered accessible name. Use an empty string when decorative. */
  alt?: string;
};
