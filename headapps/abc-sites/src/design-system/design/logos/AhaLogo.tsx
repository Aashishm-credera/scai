import Image from 'next/image';
import { cn } from '@/design-system/lib/cn';
import {
  getLogoAsset,
  getLogoDefinition,
  isLogoName,
  isLogoSize,
  isLogoVariant,
  resolveLogoName,
} from './registry';
import type { abcLogoProps, LogoAsset, LogoDefinition, LogoSize, LogoVariant } from './types';

const safeLogoPath =
  /^\/logos\/(?:abc\/(?:wordmark|symbol)\/(?:sm|md|lg)|abc\/logomark|partner\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:default|badge))\.svg$/;

function reportLogoError(message: string, value: unknown) {
  if (process.env.NODE_ENV !== 'production') console.error(message, value);
}

export function abcLogo({
  name,
  size = 'md',
  variant = 'default',
  alt,
  className,
  ...props
}: abcLogoProps) {
  const approvedName = resolveLogoName(name);
  if (!approvedName) return null;
  if (!isLogoName(name)) {
    reportLogoError(`Invalid abc logo name; rendered ${approvedName} instead.`, name);
  }
  const renderSize: LogoSize = isLogoSize(size) ? size : 'md';
  const requestedVariant: LogoVariant = isLogoVariant(variant) ? variant : 'default';
  let definition: LogoDefinition;
  let asset: LogoAsset;
  let renderVariant: LogoVariant;
  try {
    definition = getLogoDefinition(approvedName);
    ({ asset, variant: renderVariant } = getLogoAsset(definition, renderSize, requestedVariant));
  } catch (error) {
    reportLogoError('Unable to resolve an abc logo asset; rendered nothing.', error);
    return null;
  }

  if (!safeLogoPath.test(asset.assetPath)) {
    reportLogoError('Unsafe abc logo asset path; rendered nothing.', asset.assetPath);
    return null;
  }

  return (
    <Image
      {...props}
      src={asset.assetPath}
      width={asset.width}
      height={asset.height}
      // Required, not an optimisation opt-out. Every logo asset is an SVG, and Next's image
      // optimizer returns HTTP 400 for SVG unless images.dangerouslyAllowSVG is set, which we
      // deliberately leave off, since it would also permit SVGs from the edge*/xmc-* remote
      // patterns and open real XSS surface for CMS-supplied images. No test catches the removal
      // of this prop: renderToStaticMarkup emits the raw src either way, because the node test
      // environment has none of Next's injected image config. See docs/TECH-DEBT.md.
      unoptimized
      alt={alt ?? definition.label}
      data-abc-logo={definition.id}
      data-size={renderSize}
      data-variant={renderVariant}
      data-requested-variant={renderVariant === requestedVariant ? undefined : requestedVariant}
      className={cn(
        'inline-block h-auto max-w-full shrink-0 object-contain align-middle',
        className
      )}
    />
  );
}
