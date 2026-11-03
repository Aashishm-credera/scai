import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LogoPlayground } from '../stories/LogoPlayground';

describe('LogoPlayground', () => {
  it('renders an accessible logo with its asset details', () => {
    const html = renderToStaticMarkup(
      createElement(LogoPlayground, {
        name: 'partner/sectigo',
        size: 'lg',
        variant: 'badge',
        decorative: false,
        label: 'Secure site by Sectigo',
      })
    );

    expect(html).toContain('alt="Secure site by Sectigo"');
    expect(html).toContain('/logos/partner/sectigo/badge.svg');
    expect(html).toContain('106');
    expect(html).toContain('height="64"');
    expect(html).toContain('data-variant="badge"');
  });

  it('renders decorative artwork with safe runtime defaults', () => {
    const html = renderToStaticMarkup(
      createElement(LogoPlayground, {
        name: 'abc/wordmark',
        size: 'md',
        variant: 'badge',
        decorative: true,
      })
    );

    expect(html).toContain('alt=""');
    expect(html).toContain('data-variant="default"');
    expect(html).toContain('data-requested-variant="badge"');
  });
});
