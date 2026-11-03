import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { IconPlayground, isIconColorApplicable } from '../stories/IconPlayground';

describe('IconPlayground', () => {
  it('renders a meaningful approved icon at the requested size', () => {
    const html = renderToStaticMarkup(
      createElement(IconPlayground, {
        name: 'interface/general/search-lg',
        size: 'xl',
        color: 'brand-primary',
        decorative: false,
        label: 'Search',
      })
    );

    expect(html).toContain('data-abc-icon="interface/general/search-lg"');
    expect(html).toContain('data-size="xl"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Search"');
  });

  it('does not apply a semantic foreground color to multicolor artwork', () => {
    const html = renderToStaticMarkup(
      createElement(IconPlayground, {
        name: 'pictoral/cpr',
        size: '2xl',
        decorative: true,
      })
    );

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-abc-icon="pictoral/cpr"');
    expect(html).toContain('data-color-mode="multicolor"');
    expect(html).not.toContain('color:var(--abc-foreground');
  });

  it('only enables semantic color for monochrome artwork', () => {
    expect(isIconColorApplicable('interface/general/search-lg')).toBe(true);
    expect(isIconColorApplicable('pictoral/cpr')).toBe(false);
    expect(isIconColorApplicable('miscellaneous/social/facebook-gray')).toBe(false);
  });
});
