import type { JSX } from 'react';
import type { BreadcrumbProps } from './breadcrumb.props';
import { cn } from '@/design-system/lib/cn';
import { BaseBreadcrumb } from '@/design-system/atoms/BaseBreadcrumb';
import { toBreadcrumbItems } from '@/components/foundation/breadcrumb/breadcrumb-items';

export const Default = ({ page, params, fields }: BreadcrumbProps): JSX.Element | null => {
  const id = params?.RenderingIdentifier;
  const language = page?.layout.sitecore.context.language;
  const breadcrumbs = toBreadcrumbItems(fields?.data?.item?.ancestors, language);

  if (breadcrumbs.length) {
    return (
      <div className={cn('component', params?.styles)} id={id}>
        <BaseBreadcrumb breadcrumbItems={breadcrumbs} />
      </div>
    );
  }

  return (
    <div id={id} className={cn('component', params?.styles)} >
      [No breadcrumb items found. To include pages in the breadcrumb, set{' '}
      <strong>ExcludeFromBreadcrumb</strong> to <strong>false</strong> in the page settings of each
      page you want to include.]
    </div>
  );
};
