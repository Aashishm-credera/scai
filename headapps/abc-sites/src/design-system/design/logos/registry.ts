import type {
  LogoAsset,
  LogoCategory,
  LogoDefinition,
  LogoName,
  LogoSize,
  LogoVariant,
} from './types';

const scaledAssets = (
  assetPath: LogoAsset['assetPath'],
  sourceWidth: number,
  sourceHeight: number,
  heights: Readonly<Record<LogoSize, number>>
): Readonly<Record<LogoSize, LogoAsset>> =>
  Object.fromEntries(
    Object.entries(heights).map(([size, height]) => [
      size,
      {
        assetPath,
        width: Math.round((sourceWidth / sourceHeight) * height),
        height,
      },
    ])
  ) as Record<LogoSize, LogoAsset>;

const partnerAssets = (slug: string, width: number): LogoDefinition['assets'] => ({
  default: scaledAssets(`/logos/partner/${slug}/default.svg`, width, 64, {
    sm: 40,
    md: 52,
    lg: 64,
  }),
  badge: scaledAssets(`/logos/partner/${slug}/badge.svg`, width, 64, { sm: 40, md: 52, lg: 64 }),
});

export const logoDefinitions = [
  {
    id: 'abc/wordmark',
    name: 'wordmark',
    label: 'American Heart Association',
    category: 'abc',
    sourceName: 'abc Logo',
    variants: ['default'],
    assets: {
      default: {
        sm: { assetPath: '/logos/abc/wordmark/sm.svg', width: 119, height: 41 },
        md: { assetPath: '/logos/abc/wordmark/md.svg', width: 141, height: 49 },
        lg: { assetPath: '/logos/abc/wordmark/lg.svg', width: 166, height: 58 },
      },
    },
  },
  {
    id: 'abc/symbol',
    name: 'symbol',
    label: 'American Heart Association',
    category: 'abc',
    sourceName: 'abc Logo symbol',
    variants: ['default'],
    assets: {
      default: {
        sm: { assetPath: '/logos/abc/symbol/sm.svg', width: 35, height: 41 },
        md: { assetPath: '/logos/abc/symbol/md.svg', width: 41, height: 49 },
        lg: { assetPath: '/logos/abc/symbol/lg.svg', width: 49, height: 58 },
      },
    },
  },
  {
    id: 'abc/logomark',
    name: 'logomark',
    label: 'American Heart Association',
    category: 'abc',
    sourceName: 'American Heart Association Logo 2',
    variants: ['default'],
    assets: {
      default: scaledAssets('/logos/abc/logomark.svg', 32, 32, { sm: 24, md: 32, lg: 48 }),
    },
  },
  {
    id: 'partner/bbb-accredited-charity',
    name: 'bbb-accredited-charity',
    label: 'BBB Accredited Charity',
    category: 'partner',
    sourceName: 'Company=BBB Accredited Charity',
    variants: ['default', 'badge'],
    assets: partnerAssets('bbb-accredited-charity', 40),
  },
  {
    id: 'partner/charity-navigator',
    name: 'charity-navigator',
    label: 'Charity Navigator',
    category: 'partner',
    sourceName: 'Company=Charity Navigator',
    variants: ['default', 'badge'],
    assets: partnerAssets('charity-navigator', 75),
  },
  {
    id: 'partner/national-health-council',
    name: 'national-health-council',
    label: 'National Health Council',
    category: 'partner',
    sourceName: 'Company=National Health Council',
    variants: ['default', 'badge'],
    assets: partnerAssets('national-health-council', 62),
  },
  {
    id: 'partner/sectigo',
    name: 'sectigo',
    label: 'Sectigo',
    category: 'partner',
    sourceName: 'Company=Sectigo',
    variants: ['default', 'badge'],
    assets: partnerAssets('sectigo', 106),
  },
] as const satisfies readonly LogoDefinition[];

export const logoRegistry = new Map<LogoName, LogoDefinition>(
  logoDefinitions.map((logo) => [logo.id, logo])
);

export const logoCounts = {
  total: logoDefinitions.length,
  abc: logoDefinitions.filter((logo) => logo.category === 'abc').length,
  partner: logoDefinitions.filter((logo) => logo.category === 'partner').length,
} as const;

export function isLogoName(value: unknown): value is LogoName {
  return typeof value === 'string' && logoRegistry.has(value as LogoName);
}

export function isLogoSize(value: unknown): value is LogoSize {
  return value === 'sm' || value === 'md' || value === 'lg';
}

export function isLogoVariant(value: unknown): value is LogoVariant {
  return value === 'default' || value === 'badge';
}

export function getLogoDefinition(name: LogoName): LogoDefinition {
  const definition = logoRegistry.get(name);
  if (!definition) throw new Error(`Unknown abc logo: ${name}`);
  return definition;
}

export function getLogoAsset(
  definition: LogoDefinition,
  size: LogoSize,
  variant: LogoVariant
): { asset: LogoAsset; variant: LogoVariant } {
  const resolvedVariant = definition.assets[variant] ? variant : 'default';
  const asset = definition.assets[resolvedVariant]?.[size];
  if (!asset) throw new Error(`Missing ${size} asset for abc logo: ${definition.id}`);
  return { asset, variant: resolvedVariant };
}

export function getLogosByCategory(category: LogoCategory): readonly LogoDefinition[] {
  return logoDefinitions.filter((logo) => logo.category === category);
}

/** Resolves untrusted CMS input without ever treating it as a URL or file path. */
export function resolveLogoName(
  value: unknown,
  fallback: LogoName | null = 'abc/wordmark'
): LogoName | null {
  if (isLogoName(value)) return value;
  if (typeof value === 'string' && value.startsWith('partner/')) return null;
  return fallback && isLogoName(fallback) ? fallback : null;
}
