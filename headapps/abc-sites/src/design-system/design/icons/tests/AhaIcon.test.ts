import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { abcIcon } from '../abcIcon';
import { SitecoreIcon } from '../SitecoreIcon';
import * as iconRegistryModule from '../registry';
import type { IconName, IconSize } from '../types';

describe('abcIcon', () => {
  it('renders a decorative monochrome icon with token sizing and currentColor', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'interface/general/heart',
        size: 'xl',
        className: 'text-primary',
        'aria-hidden': true,
      })
    );

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-abc-icon="interface/general/heart"');
    expect(html).toContain('data-color-mode="monochrome"');
    expect(html).toContain('var(--abc-icon-size-xl)');
    expect(html).toContain('background-color:currentColor');
    expect(html).toContain('/icons/interface/heart.svg');
  });

  it('gives a meaningful icon an accessible name', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, { name: 'interface/general/check', 'aria-label': 'Complete' })
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Complete"');
    expect(html).not.toContain('aria-hidden');
  });

  it('resolves semantic color for monochrome artwork', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'interface/general/check',
        color: 'brand-primary',
        'aria-hidden': true,
      })
    );

    expect(html).toContain('color:var(--abc-foreground-brand-primary)');
  });

  it('allows Tailwind sizing utilities to override the token size', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'interface/general/check',
        className: 'size-5',
        'aria-hidden': true,
      })
    );
    expect(html).toContain('size-5');
    expect(html).not.toContain('size-[var(--abc-icon-size-lg)]');
  });

  it('preserves intentional multicolor artwork', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'miscellaneous/social/facebook',
        'aria-label': 'Facebook',
      })
    );
    expect(html).toContain('data-color-mode="multicolor"');
    expect(html).toContain(
      'background-image:url(&quot;/icons/miscellaneous/social/facebook.svg&quot;)'
    );
    expect(html).not.toContain('mask-image');
  });

  it('renders the approved gray Social variant as a fixed-palette asset', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'miscellaneous/social/facebook-gray',
        'aria-label': 'Facebook',
      })
    );

    expect(html).toContain('data-abc-icon="miscellaneous/social/facebook-gray"');
    expect(html).toContain('data-color-mode="multicolor"');
    expect(html).toContain('/icons/miscellaneous/social/facebook-gray.svg');
    expect(html).not.toContain('mask-image');
  });

  it('derives wide icon proportions from generated SVG dimensions', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'miscellaneous/payment/visa',
        size: 'md',
        'aria-hidden': true,
      })
    );

    expect(html).toContain('aspect-ratio:46 / 32');
    expect(html).toContain('var(--abc-icon-size-md)');
    expect(html).not.toContain('1.4375');
  });

  it('degrades an invalid runtime name to the safe placeholder', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'interface/general/x\");background:url(https://example.com)' as IconName,
      })
    );

    expect(html).toContain('data-abc-icon="interface/general/placeholder"');
    expect(html).not.toContain('example.com');
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });

  it('renders nothing when an approved definition cannot be resolved', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const getIconDefinition = vi
      .spyOn(iconRegistryModule, 'getIconDefinition')
      .mockImplementationOnce(() => {
        throw new Error('broken registry');
      });

    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'interface/general/check',
        'aria-hidden': true,
      })
    );

    expect(html).toBe('');
    expect(consoleError).toHaveBeenCalledWith(
      'Unable to resolve an abc icon definition; rendered nothing.',
      expect.any(Error)
    );
    getIconDefinition.mockRestore();
    consoleError.mockRestore();
  });

  it('renders the approved placeholder for a quarantined asset', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'miscellaneous/integrations/igtv',
        'aria-label': 'IGTV',
      })
    );

    expect(html).toContain('data-abc-icon="interface/general/placeholder"');
    expect(html).toContain('data-requested-icon="miscellaneous/integrations/igtv"');
  });

  it('falls back to the default token size for an invalid runtime value', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'interface/general/check',
        size: 'not-a-size' as IconSize,
        'aria-hidden': true,
      })
    );

    expect(html).toContain('data-size="lg"');
    expect(html).toContain('var(--abc-icon-size-lg)');
  });
});

describe('SitecoreIcon', () => {
  it('renders an allowlisted CMS icon', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreIcon, { name: 'interface/general/heart', 'aria-hidden': true })
    );
    expect(html).toContain('data-abc-icon="interface/general/heart"');
  });

  it('forwards semantic colors to allowlisted monochrome icons', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreIcon, {
        name: 'interface/general/heart',
        color: 'inverse',
        'aria-hidden': true,
      })
    );

    expect(html).toContain('color:var(--abc-foreground-inverse-primary)');
  });

  it('renders a legacy Interface CMS ID through its canonical alias', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreIcon, { name: 'interface/search-lg', 'aria-label': 'Search' })
    );

    expect(html).toContain('data-abc-icon="interface/general/search-lg"');
    expect(html).toContain('aria-label="Search"');
  });

  it('renders a monochrome Pictoral stroke variant', () => {
    const html = renderToStaticMarkup(
      createElement(abcIcon, {
        name: 'pictoral/search',
        color: 'brand-primary',
        'aria-hidden': true,
      })
    );

    expect(html).toContain('data-color-mode="monochrome"');
    expect(html).toContain('/icons/pictoral/search.svg');
    expect(html).toContain('color:var(--abc-foreground-brand-primary)');
  });

  it('never renders CMS-provided SVG markup', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreIcon, {
        name: '<svg><script>alert(1)</script></svg>',
        'aria-hidden': true,
      })
    );
    expect(html).toContain('data-abc-icon="interface/general/placeholder"');
    expect(html).not.toContain('<script>');
  });

  it('can render nothing for an invalid value when fallback is disabled', () => {
    expect(
      renderToStaticMarkup(createElement(SitecoreIcon, { name: 'unknown', fallback: null }))
    ).toBe('');
  });
});
