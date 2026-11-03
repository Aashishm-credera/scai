import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Default as Breadcrumb } from '@/components/features/Navigation/Breadcrumb/Breadcrumb';
import type { BreadcrumbProps } from '@/components/features/Navigation/Breadcrumb/breadcrumb.props';

const ancestors = [
  {
    id: 'parent',
    name: 'Parent',
    NavigationTitle: { value: 'Health topics' },
    url: { path: '/health/' },
    IsExcludedFromBreadcrumb: { value: false },
  },
  {
    id: 'home',
    name: 'Home',
    url: { path: '/' },
    IsExcludedFromBreadcrumb: { value: false },
  },
];

function makeProps(): BreadcrumbProps {
  return {
    params: { RenderingIdentifier: 'breadcrumb-rendering' },
    rendering: { componentName: 'Breadcrumb' },
    page: { layout: { sitecore: { context: { language: 'en' } } } },
    fields: {
      data: {
        item: {
          id: 'current',
          name: 'Current page',
          url: { path: '/health/current' },
          IsExcludedFromBreadcrumb: { value: false },
          ancestors: ancestors.map((item) => ({ ...item })),
        },
      },
    },
  } as BreadcrumbProps;
}

describe('Sitecore Breadcrumb', () => {
  it('renders ancestors in site order without the current page or mutating CMS data', () => {
    const props = makeProps();
    const html = renderToStaticMarkup(<Breadcrumb {...props} />);

    expect([...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1])).toEqual([
      '/en',
      '/en/health',
    ]);
    expect(html).toContain('id="breadcrumb-rendering"');
    expect(html).toContain('Health topics');
    expect(html).not.toContain('Current page');
    expect(html).not.toContain('aria-current');
    expect(props.fields.data.item.ancestors?.map((item) => item.id)).toEqual(['parent', 'home']);
  });

  it('renders Home alone for a page directly below Home', () => {
    const props = makeProps();
    props.fields.data.item.ancestors = [ancestors[1]];
    const html = renderToStaticMarkup(<Breadcrumb {...props} />);

    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).not.toContain('data-breadcrumb-separator');
    expect(html).not.toContain('<button');
  });

  it('omits excluded ancestors', () => {
    const props = makeProps();
    props.fields.data.item.ancestors![0].IsExcludedFromBreadcrumb = { value: true };
    const html = renderToStaticMarkup(<Breadcrumb {...props} />);

    expect(html).toContain('Home');
    expect(html).not.toContain('Health topics');
    expect(html).not.toContain('Current page');
  });
});
