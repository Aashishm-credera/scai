import { abcIcon } from './abcIcon';
import { resolveIconName } from './registry';
import type { abcIconProps, IconName } from './types';

export type SitecoreIconProps = Omit<abcIconProps, 'name'> & {
  /** Untrusted value supplied by an XM Cloud field or rendering parameter. */
  name?: string | null;
  fallback?: IconName | null;
};

export function SitecoreIcon({
  name,
  fallback = 'interface/general/placeholder',
  ...props
}: SitecoreIconProps) {
  const approvedName = resolveIconName(name, fallback);
  return approvedName ? <abcIcon name={approvedName} {...props} /> : null;
}
