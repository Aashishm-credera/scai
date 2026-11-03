import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { IconDocumentation } from '../stories/IconDocumentation';

describe('IconDocumentation', () => {
  it('documents the Sitecore, accessibility, token, and update contracts', () => {
    const html = renderToStaticMarkup(createElement(IconDocumentation));

    expect(html).toContain('Sitecore backend');
    expect(html).toContain('SitecoreIcon');
    expect(html).toContain('aria-hidden');
    expect(html).toContain('--abc-foreground-brand-primary');
    expect(html).toContain('npm run icons:build');
    expect(html).toContain('docs/ICONS.md');
    expect(html).toContain('tabindex="0"');
  });
});
