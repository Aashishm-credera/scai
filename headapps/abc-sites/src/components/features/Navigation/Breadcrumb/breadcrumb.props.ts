import type { ComponentProps } from '@/lib/component-props';
import type { BreadcrumbPage } from '@/components/foundation/breadcrumb/breadcrumb-items';

export interface BreadcrumbProps extends ComponentProps {
  fields: {
    data: {
      item: BreadcrumbPage & {
        ancestors?: Array<BreadcrumbPage>;
      };
    };
  };
}
