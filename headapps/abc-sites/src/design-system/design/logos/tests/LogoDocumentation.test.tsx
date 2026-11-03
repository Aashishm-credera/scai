import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LogoDocumentation } from '../stories/LogoDocumentation';

describe('LogoDocumentation', () => {
  it('documents registry, Sitecore, accessibility, variants, and sizing', () => {
    const html = renderToStaticMarkup(createElement(LogoDocumentation));

    expect(html).toContain('Canonical values');
    expect(html).toContain('SitecoreLogo');
    expect(html).toContain('Accessibility');
    expect(html).toContain('badge');
    expect(html).toContain('fallback');
    expect(html).toContain('partner/*');
    expect(html).toContain('values render nothing');
    expect(html).toContain('tabindex="0"');
  });
});
