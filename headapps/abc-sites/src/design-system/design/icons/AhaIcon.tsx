import { cn } from '@/design-system/lib/cn';
import { getRenderableIconName } from './availability';
import { getIconDefinition, isIconName } from './registry';
import type { abcIconProps, IconColor, IconDefinition, IconSize } from './types';

const squareIconSize: Record<IconSize, string> = {
  sm: 'size-[var(--abc-icon-size-sm)]',
  md: 'size-[var(--abc-icon-size-md)]',
  lg: 'size-[var(--abc-icon-size-lg)]',
  xl: 'size-[var(--abc-icon-size-xl)]',
  '2xl': 'size-[var(--abc-icon-size-2xl)]',
};

const wideIconHeight: Record<IconSize, string> = {
  sm: 'h-[var(--abc-icon-size-sm)] w-auto',
  md: 'h-[var(--abc-icon-size-md)] w-auto',
  lg: 'h-[var(--abc-icon-size-lg)] w-auto',
  xl: 'h-[var(--abc-icon-size-xl)] w-auto',
  '2xl': 'h-[var(--abc-icon-size-2xl)] w-auto',
};

const iconColor: Record<IconColor, string> = {
  default: 'var(--abc-foreground-default-primary)',
  'brand-primary': 'var(--abc-foreground-brand-primary)',
  'brand-secondary': 'var(--abc-foreground-brand-secondary)',
  disabled: 'var(--abc-foreground-default-disabled)',
  inverse: 'var(--abc-foreground-inverse-primary)',
};

const safeIconPath =
  /^(?:interface\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*|pictoral\/(?:strokes\/)?[a-z0-9]+(?:-[a-z0-9]+)*|miscellaneous\/(?:payment|integrations|flags|social)\/[a-z0-9]+(?:-[a-z0-9]+)*)$/;
const fallbackIconName = 'interface/general/placeholder' as const;

function reportInvalidIconName(name: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`Invalid abc icon name; rendered ${fallbackIconName} instead.`, name);
  }
}

export function abcIcon({
  name,
  size = 'lg',
  className,
  color,
  style,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  role,
  ...props
}: abcIconProps) {
  const approvedName =
    typeof name === 'string' && safeIconPath.test(name) && isIconName(name)
      ? name
      : fallbackIconName;
  if (approvedName !== name) reportInvalidIconName(name);

  const renderName = getRenderableIconName(approvedName);
  let definition: IconDefinition;
  try {
    definition = getIconDefinition(renderName);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Unable to resolve an abc icon definition; rendered nothing.', error);
    }
    return null;
  }
  const renderSize: IconSize = Object.prototype.hasOwnProperty.call(squareIconSize, size)
    ? size
    : 'lg';
  const resolvedColor = color && iconColor[color];
  const decorative = ariaHidden === true || ariaHidden === 'true' || !ariaLabel;
  const wideArtwork = definition.width !== definition.height;
  const sizeClass = wideArtwork ? wideIconHeight[renderSize] : squareIconSize[renderSize];
  const colorMode = definition.colorMode;
  const assetPath = definition.assetPath;
  const imageStyle =
    colorMode === 'monochrome'
      ? {
          backgroundColor: 'currentColor',
          maskImage: `url("${assetPath}")`,
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          maskSize: 'contain',
          WebkitMaskImage: `url("${assetPath}")`,
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
        }
      : {
          backgroundImage: `url("${assetPath}")`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        };

  return (
    <span
      {...props}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
      role={decorative ? undefined : (role ?? 'img')}
      data-abc-icon={renderName}
      data-requested-icon={renderName === approvedName ? undefined : approvedName}
      data-color-mode={colorMode}
      data-size={renderSize}
      className={cn('inline-block shrink-0 align-middle', sizeClass, className)}
      style={{
        ...imageStyle,
        aspectRatio: wideArtwork ? `${definition.width} / ${definition.height}` : undefined,
        color: resolvedColor,
        ...style,
      }}
    />
  );
}
