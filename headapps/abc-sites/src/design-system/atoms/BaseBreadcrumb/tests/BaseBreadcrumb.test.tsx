import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BaseBreadcrumb } from '../BaseBreadcrumb';

describe('BaseBreadcrumb', () => {
  it('renders nothing for an empty trail', () => {
    expect(renderToStaticMarkup(<BaseBreadcrumb breadcrumbItems={[]} />)).toBe('');
  });

  it('uses ancestor semantics without marking Parent as the current page', () => {
    const html = renderToStaticMarkup(
      <BaseBreadcrumb
        breadcrumbItems={[
          { title: 'Home', url: '/home' },
          { title: 'Prevention', url: '/prevention' },
        ]}
      />
    );

    expect(html).toContain('<nav aria-label="Breadcrumb"');
    expect(html).toContain('<ol');
    expect(html).not.toContain('aria-current');
    expect(html.match(/data-breadcrumb-separator=""/g)).toHaveLength(1);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-size="sm"');
  });

  it('renders the full ancestor label through the shared Button link variant', () => {
    const html = renderToStaticMarkup(
      <BaseBreadcrumb breadcrumbItems={[{ title: 'Home', url: '/home' }]} />
    );

    expect(html).toContain('href="/home"');
    expect(html).toContain('>Home</a>');
    expect(html).toContain('link-button');
  });

  it('falls back to the URL when the title is omitted', () => {
    const html = renderToStaticMarkup(<BaseBreadcrumb breadcrumbItems={[{ url: '/home' }]} />);

    expect(html).toContain('href="/home"');
    expect(html).toContain('>/home</a>');
  });

  it('supports ReactNode titles and empty URLs for non-link items', () => {
    const html = renderToStaticMarkup(
      <BaseBreadcrumb breadcrumbItems={[{ url: '', title: <strong>Parent page</strong> }]} />
    );

    expect(html).toContain('<strong>Parent page</strong>');
    expect(html).not.toContain('aria-current');
    expect(html).not.toContain('<a ');
  });

  it('shows Home alone without a separator or collapse control', () => {
    const html = renderToStaticMarkup(
      <BaseBreadcrumb breadcrumbItems={[{ title: 'Home', url: '/home' }]} />
    );
    expect(html).not.toContain('data-breadcrumb-separator');
    expect(html).not.toContain('<button');
  });

  it('renders separate mobile and desktop trails when collapse behavior differs', () => {
    const html = renderToStaticMarkup(
      <BaseBreadcrumb
        breadcrumbItems={[
          { title: 'Home', url: '/home' },
          { title: 'Health topics', url: '/health-topics' },
          { title: 'Heart health', url: '/health-topics/heart-health' },
          { title: 'Prevention', url: '/prevention' },
        ]}
      />
    );

    expect(html.match(/<ol/g)).toHaveLength(2);
    expect(html).toContain('breadcrumb-trail-mobile');
    expect(html).toContain('breadcrumb-trail-desktop');
    expect(html.match(/aria-label="Show hidden breadcrumb pages"/g)).toHaveLength(2);
  });

  it('keeps the complete label in the DOM while applying visual truncation', () => {
    const label = 'Understanding heart failure and available treatment options';
    const html = renderToStaticMarkup(
      <BaseBreadcrumb
        breadcrumbItems={[
          { title: 'Home', url: '/home' },
          { title: label, url: '', tooltipLabel: label },
        ]}
      />
    );

    expect(html).toContain(label);
    expect(html).toContain('data-breadcrumb-label=""');
    expect(html).toContain('breadcrumb-label-truncate');
    expect(html).toContain(`aria-label="${label}"`);
  });
});
