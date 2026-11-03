import { abcLogo } from './abcLogo';
import { isLogoName, isLogoSize, isLogoVariant, resolveLogoName } from './registry';
import type { abcLogoProps, LogoName } from './types';

export type SitecoreLogoProps = Omit<abcLogoProps, 'name' | 'size' | 'variant'> & {
  /** Untrusted registry value supplied by an XM Cloud field or rendering parameter. */
  name?: string | null;
  size?: string | null;
  variant?: string | null;
  fallback?: LogoName | null;
};

export function SitecoreLogo({
  name,
  size,
  variant,
  fallback = 'abc/wordmark',
  ...props
}: SitecoreLogoProps) {
  const approvedName = resolveLogoName(name, fallback);
  if (!approvedName) return null;
  const alt = isLogoName(name) ? props.alt : undefined;

  return (
    <abcLogo
      name={approvedName}
      size={isLogoSize(size) ? size : 'md'}
      variant={isLogoVariant(variant) ? variant : 'default'}
      {...props}
      alt={alt}
    />
  );
}
