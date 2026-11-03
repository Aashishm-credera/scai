import exceptions from '@design-tokens/icons/icon-asset-exceptions.json';
import type { IconName } from './types';

export const iconAssetExceptions = exceptions as Readonly<Partial<Record<IconName, string>>>;

export function isIconAssetAvailable(name: IconName): boolean {
  return !Object.prototype.hasOwnProperty.call(iconAssetExceptions, name);
}

export function getRenderableIconName(name: IconName): IconName {
  return isIconAssetAvailable(name) ? name : 'interface/general/placeholder';
}
