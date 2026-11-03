import type { FieldMetadata, LinkField } from '@sitecore-content-sdk/nextjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button, type ButtonProps } from '../Button';

const plainLink = {
  url: '/donate',
  title: 'Donate now',
};

const linkField: LinkField = {
  value: {
    href: '/heart-health',
    linktype: 'internal',
    text: 'Heart health',
  },
};

const pageBuilderLinkField: LinkField & FieldMetadata = {
  ...linkField,
  metadata: {},
};

function renderButton(overrides: Partial<ButtonProps> = {}) {
  return renderToStaticMarkup(
    <Button variant="primary" link={plainLink} styles="" {...overrides} />
  );
}

function anchorCount(html: string) {
  return html.match(/<a\b/g)?.length ?? 0;
}

function anchorClassName(html: string) {
  return html.match(/<a\b[^>]*\bclass="([^"]*)"/)?.[1] ?? '';
}

describe('Button', () => {
  it('renders a Sitecore linkField through the Content SDK Link component', () => {
    const html = renderButton({ link: undefined, linkField, variant: 'link' });

    expect(html).toMatch(/^<a /);
    expect(anchorCount(html)).toBe(1);
    expect(html).toContain('href="/heart-health"');
    expect(html).toContain('Heart health');
    expect(html).toContain('role="link"');
    expect(html).toContain('aria-label="Heart health"');
    expect(anchorClassName(html)).toContain('link-button');
  });

  it('renders a plain link through Next.js Link', () => {
    const html = renderButton({
      link: { url: '/donate/monthly', title: 'Donate monthly', target: '_self' },
    });

    expect(html).toMatch(/^<a /);
    expect(anchorCount(html)).toBe(1);
    expect(html).toContain('href="/donate/monthly"');
    expect(html).toContain('role="link"');
    expect(html).toContain('target="_self"');
    expect(html).toContain('Donate monthly');
  });

  it('accepts LinkField and FieldMetadata for Page Builder editing', () => {
    const html = renderButton({ link: undefined, linkField: pageBuilderLinkField });

    expect(anchorCount(html)).toBe(1);
    expect(html).toContain('href="/heart-health"');
    expect(html).toContain('Heart health');
  });

  it('prefers a valid linkField and renders only one destination', () => {
    const html = renderButton({
      link: { url: '/plain-destination', title: 'Plain destination' },
      linkField,
    });

    expect(anchorCount(html)).toBe(1);
    expect(html).toContain('href="/heart-health"');
    expect(html).toContain('Heart health');
    expect(html).not.toContain('/plain-destination');
    expect(html).not.toContain('Plain destination');
  });

  it('falls back to a valid plain link when linkField is unusable', () => {
    const html = renderButton({
      linkField: { value: { href: '/missing-label', text: ' ' } },
    });

    expect(anchorCount(html)).toBe(1);
    expect(html).toContain('href="/donate"');
    expect(html).toContain('Donate now');
    expect(html).not.toContain('/missing-label');
  });

  it.each([
    ['primary', true],
    ['secondary', true],
    ['tertiary', false],
    ['link', false],
  ] as const)('styles the %s variant, with a ::before surface: %s', (variant, hasSurface) => {
    const className = anchorClassName(renderButton({ variant, styles: 'layout-style' }));

    expect(className).toContain('group/button');
    expect(className).toContain(`${variant}-button`);
    expect(className).toContain('layout-style');
    expect(className.includes('before:shadow-abc-elevation-low-')).toBe(hasSurface);
  });

  it.each(['primary', 'secondary', 'tertiary'] as const)(
    'uses the shared spacing token for the %s icon-to-label gap',
    (variant) => {
      const className = anchorClassName(
        renderButton({ variant, icon: 'interface/arrows/arrow-right' })
      );

      expect(className.split(' ')).toContain('gap-(--abc-spacing-gap-sm)');
      expect(className).not.toContain('gap-[calc(var(--abc-spacing-gap-sm)');
    }
  );

  it.each(['primary', 'secondary'] as const)(
    'uses responsive button padding tokens for the %s variant without extra label inset',
    (variant) => {
      const className = anchorClassName(renderButton({ variant }));

      expect(className.split(' ')).toContain('px-(--abc-buttons-padding-x-md)');
      expect(className.split(' ')).toContain('py-(--abc-buttons-padding-y-md)');
      expect(className).not.toContain('abc-buttons-padding-x-label');
    }
  );

  it('uses responsive vertical padding and no horizontal padding for tertiary', () => {
    const className = anchorClassName(renderButton({ variant: 'tertiary' }));

    expect(className.split(' ')).toContain('px-(--abc-buttons-padding-x-flush)');
    expect(className.split(' ')).toContain('py-(--abc-buttons-padding-y-md)');
    expect(className).not.toContain('abc-buttons-padding-x-label');
  });

  it('falls back to primary for an unknown variant', () => {
    const className = anchorClassName(renderButton({ variant: 'unknown' }));

    expect(className).toContain('text-(--abc-text-inverse-primary)');
    expect(className).toContain('before:shadow-abc-elevation-low-brand');
  });

  // Page builder replaces a Link field's children with the new text when an author edits it, so
  // anything but the bare label inside the anchor disappears mid-edit.
  it.each([
    ['primary', {}],
    ['secondary', { icon: 'interface/arrows/arrow-right' }],
    ['tertiary', { icon: 'interface/arrows/arrow-right', styles: 'button-icon-right' }],
    ['link', { isLoading: true }],
  ] as const)('keeps the label as the only child of the %s anchor', (variant, props) => {
    expect(renderButton({ variant, ...props })).toMatch(/^<a [^>]*>Donate now<\/a>$/);
  });

  it('carries the icon on the anchor for its ::after', () => {
    const html = renderButton({ icon: 'interface/arrows/arrow-right' });

    expect(html).toContain('data-icon-name="interface/arrows/arrow-right"');
    expect(html).toContain('data-icon-color-mode="monochrome"');
    expect(html).toMatch(/style="--button-icon-image:url\(&quot;\/icons\/[^"]+\.svg&quot;\)"/);
    expect(anchorClassName(html).split(' ')).toContain('icon-arrow-right');
  });

  it('puts the icon left by default and right with button-icon-right, in CSS', () => {
    const left = anchorClassName(renderButton({ icon: 'interface/arrows/arrow-right' }));
    const right = anchorClassName(
      renderButton({ icon: 'interface/arrows/arrow-right', styles: 'button-icon-right' })
    );

    expect(left).toContain('[data-icon-name]:not(.button-icon-right)]:flex-row-reverse');
    expect(left.split(' ')).not.toContain('button-icon-right');
    expect(right.split(' ')).toContain('button-icon-right');
  });

  it('renders no icon markup when icon is absent', () => {
    const html = renderButton({ styles: 'button-icon-right' });

    expect(html).not.toContain('data-icon-name=');
    expect(html).not.toContain('--button-icon-image:');
  });

  it.each([
    { link: undefined },
    { link: { url: '', title: 'Missing URL' } },
    { link: { url: '/missing-title', title: ' ' } },
    { link: { url: 'javascript:alert(1)', title: 'Unsafe' } },
    { link: { url: 'data:text/html,bad', title: 'Unsafe' } },
  ] satisfies Array<Partial<ButtonProps>>)('renders nothing for an invalid plain link', (props) => {
    expect(renderButton({ ...props, linkField: undefined })).toBe('');
  });

  it.each([
    { value: { href: '', text: 'Missing URL' } },
    { value: { href: '/missing-label', text: '' } },
    { value: { href: 'javascript:alert(1)', text: 'Unsafe' } },
  ] satisfies LinkField[])('renders nothing for an invalid linkField', (invalidLinkField) => {
    expect(renderButton({ link: undefined, linkField: invalidLinkField })).toBe('');
  });

  it('renders the editing placeholder while the link is still empty', () => {
    const html = renderButton({
      link: undefined,
      linkField: { value: { href: '' }, metadata: {} },
      editingPlaceholder: '[Add button link]',
    });

    expect(anchorCount(html)).toBe(1);
    // Page builder chrome wraps the anchor; the placeholder is still the anchor's only child.
    expect(html).toMatch(/<a [^>]*>\[Add button link\]<\/a>/);
    expect(html).toContain('role="link"');
    expect(html).toContain('aria-label="[Add button link]"');
  });

  it('never writes an unsafe destination into the editing placeholder', () => {
    const html = renderButton({
      link: undefined,
      linkField: { value: { href: 'javascript:alert(1)', text: 'Unsafe' }, metadata: {} },
      editingPlaceholder: '[Add button link]',
    });

    expect(html).not.toContain('javascript:');
    expect(html).toContain('Unsafe');
  });

  it('secures a plain link that opens in a new tab', () => {
    const html = renderButton({
      link: { url: 'https://www.heart.org', title: 'Heart.org', target: '_blank' },
    });

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('secures a Sitecore linkField that opens in a new tab', () => {
    const html = renderButton({
      link: undefined,
      linkField: {
        value: {
          href: 'https://www.heart.org',
          linktype: 'external',
          target: '_blank',
          text: 'Heart.org',
        },
      },
    });

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('exposes the visible label as the accessible name and allows wrapping in narrow containers', () => {
    const html = renderButton();

    expect(html).toContain('aria-label="Donate now"');
    expect(anchorClassName(html)).toContain('whitespace-normal');
    expect(anchorClassName(html)).toContain('max-w-full');
    expect(html).toContain('>Donate now</a>');
  });

  it('applies the Figma disabled, loading, and selected anchor states', () => {
    const disabled = renderButton({ disabled: true });
    const loading = renderButton({ isLoading: true, variant: 'secondary' });
    const disabledAndLoading = renderButton({ disabled: true, isLoading: true });
    const selected = renderButton({ isCurrent: true, variant: 'secondary' });

    expect(disabled).toContain('aria-disabled="true"');
    expect(disabled).toContain('aria-label="Donate now, disabled"');
    expect(disabled).not.toContain('tabindex=');
    expect(anchorClassName(disabled)).toContain('aria-disabled:pointer-events-none');
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('aria-disabled="true"');
    expect(loading).toContain('aria-label="Loading"');
    expect(loading).not.toContain('tabindex=');
    expect(disabledAndLoading).toContain('aria-busy="true"');
    expect(disabledAndLoading).toContain('aria-disabled="true"');
    expect(disabledAndLoading).toContain('aria-label="Loading"');
    expect(selected).toContain('aria-current="page"');
    expect(selected).not.toContain('tabindex=');
  });

  it('draws the loading spinner on ::before and hides the label while loading', () => {
    const className = anchorClassName(renderButton({ isLoading: true }));

    expect(className).toContain('aria-busy:before:animate-spin');
    expect(className).toContain('aria-busy:before:!block');
    expect(className).toContain('aria-busy:!text-transparent');
    expect(className).toContain('aria-busy:after:opacity-0');
  });

  it('preserves the focus, hover, active, and reduced-motion design tokens', () => {
    const html = renderButton();

    expect(html).toContain(
      'focus-visible:shadow-[0_0_0_var(--abc-space-4)_var(--abc-surface-default-primary)]'
    );
    expect(html).toContain('focus-visible:outline-(--abc-border-focus)');
    expect(html).toContain('duration-(--abc-transition-control-duration)');
    expect(html).toContain('ease-(--abc-transition-control-easing)');
    expect(html).toContain('motion-reduce:!transition-none');
    expect(html).toContain('motion-reduce:before:!transition-none');
    expect(html).toContain('motion-reduce:before:animate-none');
    expect(html).toContain('motion-reduce:hover:before:scale-100');
    expect(html).toContain('motion-reduce:active:before:scale-100');
    expect(html).toContain('hover:before:scale-[var(--abc-transform-hover-scale)]');
    expect(html).toContain('active:before:scale-[var(--abc-transform-hover-scale)]');
    expect(html).toContain('before:transition-[transform,box-shadow,background-size]');
    expect(html).toContain('before:[background-size:0%_100%,100%_100%]');
    expect(html).toContain('hover:before:[background-size:100%_100%,100%_100%]');
    expect(html).toContain('motion-reduce:before:!transition-none');
  });

  it.each([
    ['primary', 'hover:before:[background-size:100%_100%,100%_100%]'],
    ['secondary', 'hover:before:[background-size:100%_100%,100%_100%]'],
    ['tertiary', 'hover:text-(--abc-text-default-secondary-hover)'],
    ['link', 'hover:text-(--abc-surface-brand-brand-1-secondary-hover)'],
  ] as const)('animates the %s hover appearance when motion is allowed', (variant, className) => {
    const classes = anchorClassName(renderButton({ variant }));

    expect(classes).toContain(className);
  });

  it('renders ContentSdkLink directly without React element cloning', () => {
    const source = readFileSync(fileURLToPath(new URL('../Button.tsx', import.meta.url)), 'utf8');
    const forbiddenApi = ['clone', 'Element'].join('');

    expect(source).toContain('<ContentSdkLink');
    expect(source).not.toContain(forbiddenApi);
  });
});
