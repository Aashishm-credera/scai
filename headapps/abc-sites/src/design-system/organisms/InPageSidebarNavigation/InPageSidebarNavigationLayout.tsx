import { cn } from '@/design-system/lib/cn';
import type { InPageSidebarNavigationLayoutProps } from './in-page-sidebar-navigation.props';

export function InPageSidebarNavigationLayout({
  navigation,
  children,
  className,
  ...props
}: InPageSidebarNavigationLayoutProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex min-w-0 flex-col gap-y-6 pb-40 lg:flex-row lg:justify-between lg:gap-x-6 lg:pb-0',
        className
      )}
    >
      <div className="contents min-w-0 lg:block lg:w-1/4 lg:max-w-83.75 lg:shrink-0 lg:self-stretch">
        {navigation}
      </div>
      <div className="min-w-0 lg:w-2/3 lg:max-w-231">{children}</div>
    </div>
  );
}
