import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { abcLogo } from '../abcLogo';
import { SitecoreLogo } from '../SitecoreLogo';
import * as logoRegistryModule from '../registry';
import type { LogoName, LogoSize, LogoVariant } from '../types';

describe('abcLogo', () => {
  it('renders an accessible logo with approved dimensions by default', () => {
    const html = renderToStaticMarkup(createElement(abcLogo, { name: 'abc/wordmark' }));

    expect(html).toContain('src="/logos/abc/wordmark/md.svg"');
    expect(html).toContain('width="141"');
    expect(html).toContain('height="49"');
    expect(html).toContain('alt="American Heart Association"');
    expect(html).toContain('data-abc-logo="abc/wordmark"');
  });

  it('bypasses Next image optimization for approved SVG assets', () => {
    expect(abcLogo({ name: 'abc/wordmark' })).toMatchObject({
      props: { unoptimized: true },
    });
  });

  it('supports a decorative logo and additional image attributes', () => {
    const html = renderToStaticMarkup(
      createElement(abcLogo, {
        name: 'abc/symbol',
        alt: '',
        className: 'h-10',
        loading: 'lazy',
      })
    );

    expect(html).toContain('alt=""');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('h-10');
  });

  it('renders the approved partner badge asset', () => {
    const html = renderToStaticMarkup(
      createElement(abcLogo, {
        name: 'partner/sectigo',
        size: 'lg',
        variant: 'badge',
      })
    );

    expect(html).toContain('src="/logos/partner/sectigo/badge.svg"');
    expect(html).toContain('width="106"');
    expect(html).toContain('height="64"');
    expect(html).toContain('data-variant="badge"');
  });

  it('falls back to the default variant when a mark has no badge artwork', () => {
    const html = renderToStaticMarkup(
      createElement(abcLogo, { name: 'abc/logomark', variant: 'badge' })
    );

    expect(html).toContain('data-variant="default"');
    expect(html).toContain('data-requested-variant="badge"');
  });

  it('uses safe runtime defaults for invalid size and variant values', () => {
    const html = renderToStaticMarkup(
      createElement(abcLogo, {
        name: 'abc/wordmark',
        size: 'huge' as LogoSize,
        variant: 'animated' as LogoVariant,
      })
    );

    expect(html).toContain('data-size="md"');
    expect(html).toContain('data-variant="default"');
  });

  it('degrades an unknown runtime logo name to the safe default', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const html = renderToStaticMarkup(createElement(abcLogo, { name: '../../secret' as LogoName }));

    expect(html).toContain('data-abc-logo="abc/wordmark"');
    expect(html).toContain('src="/logos/abc/wordmark/md.svg"');
    expect(html).not.toContain('../');
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });

  it('renders nothing when an approved logo definition cannot be resolved', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const getLogoDefinition = vi
      .spyOn(logoRegistryModule, 'getLogoDefinition')
      .mockImplementationOnce(() => {
        throw new Error('broken registry');
      });

    expect(renderToStaticMarkup(createElement(abcLogo, { name: 'abc/wordmark' }))).toBe('');
    expect(consoleError).toHaveBeenCalledWith(
      'Unable to resolve an abc logo asset; rendered nothing.',
      expect.any(Error)
    );
    getLogoDefinition.mockRestore();
    consoleError.mockRestore();
  });

  it('rejects an unsafe asset path returned by the registry', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const getLogoAsset = vi.spyOn(logoRegistryModule, 'getLogoAsset').mockReturnValueOnce({
      asset: {
        assetPath: 'https://example.com/tracker.svg',
        width: 141,
        height: 49,
      },
      variant: 'default',
    } as unknown as ReturnType<typeof logoRegistryModule.getLogoAsset>);

    expect(renderToStaticMarkup(createElement(abcLogo, { name: 'abc/wordmark' }))).toBe('');
    expect(consoleError).toHaveBeenCalledWith(
      'Unsafe abc logo asset path; rendered nothing.',
      'https://example.com/tracker.svg'
    );
    getLogoAsset.mockRestore();
    consoleError.mockRestore();
  });
});

describe('SitecoreLogo', () => {
  it('renders allowlisted CMS values', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreLogo, {
        name: 'partner/charity-navigator',
        size: 'sm',
        variant: 'badge',
      })
    );

    expect(html).toContain('data-abc-logo="partner/charity-navigator"');
    expect(html).toContain('data-size="sm"');
    expect(html).toContain('data-variant="badge"');
  });

  it('never renders a CMS-provided URL or markup', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreLogo, {
        name: 'https://example.com/tracker.svg',
        alt: 'Brand',
      })
    );

    expect(html).toContain('src="/logos/abc/wordmark/md.svg"');
    expect(html).toContain('alt="American Heart Association"');
    expect(html).not.toContain('alt="Brand"');
    expect(html).not.toContain('example.com');
  });

  it('renders nothing for an invalid partner logo name', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreLogo, {
        name: 'partner/not-approved',
        alt: 'Unverified partner',
      })
    );

    expect(html).toBe('');
  });

  it('uses the registered abc name when an invalid abc value falls back', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreLogo, {
        name: 'abc/not-approved',
        alt: 'Incorrect CMS label',
      })
    );

    expect(html).toContain('data-abc-logo="abc/wordmark"');
    expect(html).toContain('alt="American Heart Association"');
    expect(html).not.toContain('Incorrect CMS label');
  });

  it('uses the registered fallback name for missing values and explicit fallbacks', () => {
    const missing = renderToStaticMarkup(createElement(SitecoreLogo, { alt: 'Stale CMS label' }));
    const explicit = renderToStaticMarkup(
      createElement(SitecoreLogo, {
        name: 'unknown',
        fallback: 'partner/sectigo',
        alt: 'Stale CMS label',
      })
    );

    expect(missing).toContain('alt="American Heart Association"');
    expect(missing).not.toContain('Stale CMS label');
    expect(explicit).toContain('data-abc-logo="partner/sectigo"');
    expect(explicit).toContain('alt="Sectigo"');
    expect(explicit).not.toContain('Stale CMS label');
  });

  it('normalizes invalid CMS size and variant values', () => {
    const html = renderToStaticMarkup(
      createElement(SitecoreLogo, {
        name: 'partner/sectigo',
        size: 'full',
        variant: 'night',
      })
    );

    expect(html).toContain('data-size="md"');
    expect(html).toContain('data-variant="default"');
  });

  it('can render nothing when fallback is disabled', () => {
    expect(
      renderToStaticMarkup(createElement(SitecoreLogo, { name: '<svg />', fallback: null }))
    ).toBe('');
  });
});
