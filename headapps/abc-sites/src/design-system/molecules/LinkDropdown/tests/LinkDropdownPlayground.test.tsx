import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  LinkDropdownPlayground,
  type LinkDropdownPlaygroundProps,
} from '../stories/LinkDropdownPlayground';

const baseProps: LinkDropdownPlaygroundProps = {
  defaultOpen: false,
  itemCount: 1,
  longLabel: false,
  navigationLabel: 'Hidden breadcrumb pages',
  triggerLabel: 'Show hidden breadcrumb pages',
};

describe('LinkDropdownPlayground', () => {
  it('renders the configured native trigger and usage example', () => {
    const html = renderToStaticMarkup(<LinkDropdownPlayground {...baseProps} />);

    expect(html).toContain('<button');
    expect(html).toContain('aria-label="Show hidden breadcrumb pages"');
    expect(html).toContain('Healthy Living');
    expect(html).toContain('/en/healthy-living');
    expect(html).toContain('items={hiddenBreadcrumbLinks.map(({ url, pageName }) =&gt; ({');
  });

  it.each([1, 2, 3] as const)('documents the selected %s-item set', (itemCount) => {
    const html = renderToStaticMarkup(
      <LinkDropdownPlayground {...baseProps} itemCount={itemCount} />
    );
    const code = html.match(/<code>([\s\S]*?)<\/code>/)?.[1] ?? '';

    expect(code.match(/url: &#x27;/g)).toHaveLength(itemCount);
  });

  it('shows the viewport stress label when requested', () => {
    const html = renderToStaticMarkup(<LinkDropdownPlayground {...baseProps} longLabel />);

    expect(html).toContain('A comprehensive guide to preventing cardiovascular disease');
  });

  it('reflects the localized trigger label', () => {
    const html = renderToStaticMarkup(
      <LinkDropdownPlayground {...baseProps} triggerLabel="Mostrar páginas ocultas" />
    );

    expect(html).toContain('aria-label="Mostrar páginas ocultas"');
    expect(html).toContain('triggerLabel=&quot;Mostrar páginas ocultas&quot;');
  });

  it('reflects the navigation landmark label in the usage example', () => {
    const html = renderToStaticMarkup(
      <LinkDropdownPlayground {...baseProps} navigationLabel="Collapsed breadcrumb pages" />
    );

    expect(html).toContain('navigationLabel=&quot;Collapsed breadcrumb pages&quot;');
  });
});
