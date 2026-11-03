import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { isLabelVariant, LABEL_VARIANTS, Label } from '@/design-system/atoms/Label';

describe('Label atom', () => {
  it('renders the content and default neutral variant', () => {
    const html = renderToStaticMarkup(<Label>General information</Label>);

    expect(html).toContain('General information');
    expect(html).toContain('bg-(--abc-accent-surface-neutral)');
    expect(html).toContain('text-(--badge-foreground-neutral)');
  });

  it('uses responsive typography tokens and wraps label text within the pill', () => {
    const html = renderToStaticMarkup(<Label variant="success">Recommended</Label>);

    expect(html).toContain('font-sans');
    expect(html).toContain('font-bold');
    expect(html).toContain('text-(length:--abc-font-size-label-md)');
    expect(html).toContain('leading-(--abc-font-line-height-label-md)');
    expect(html).toContain('text-(--abc-feedback-success-text-primary)');
    expect(html).toContain('rounded-(--abc-radius-pill)');
    expect(html).toContain('gap-(--abc-spacing-gap-sm)');
    expect(html).toContain('px-(--abc-spacing-inset-md)');
    expect(html).toContain('max-w-full');
    expect(html).toContain('min-w-0 wrap-anywhere');
    expect(html).not.toContain('shrink-0');
  });

  it.each(LABEL_VARIANTS)('renders the %s variant', (variant) => {
    const html = renderToStaticMarkup(<Label variant={variant}>{variant}</Label>);

    expect(html).toContain(`>${variant}</span>`);
  });

  it('does not render an icon by default', () => {
    const html = renderToStaticMarkup(
      <Label icon="interface/general/check" variant="success">
        Approved
      </Label>
    );

    expect(html).not.toContain('data-abc-icon="interface/general/check"');
    expect(html).toContain('Approved');
  });

  it('renders a leading Sitecore icon when requested', () => {
    const html = renderToStaticMarkup(
      <Label icon="interface/general/check" iconPosition="left" variant="success">
        Approved
      </Label>
    );

    expect(html.indexOf('data-abc-icon="interface/general/check"')).toBeLessThan(
      html.indexOf('Approved')
    );
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('ps-(--abc-spacing-inset-sm)');
    expect(html).toContain('pe-(--abc-spacing-inset-md)');
    expect(html).toContain('var(--abc-feedback-success-icon-primary)');
  });

  it('renders the icon on the right when requested', () => {
    const html = renderToStaticMarkup(
      <Label icon="interface/general/check" iconPosition="right" variant="success">
        Approved
      </Label>
    );

    expect(html.indexOf('Approved')).toBeLessThan(
      html.indexOf('data-abc-icon="interface/general/check"')
    );
    expect(html).toContain('ps-(--abc-spacing-inset-md)');
    expect(html).toContain('pe-(--abc-spacing-inset-sm)');
  });

  it('supports caller classes and span attributes', () => {
    const html = renderToStaticMarkup(
      <Label className="custom-label" data-testid="shared-label">
        Shared
      </Label>
    );

    expect(html).toContain('custom-label');
    expect(html).toContain('data-testid="shared-label"');
  });

  it('validates variant values', () => {
    expect(isLabelVariant('warning')).toBe(true);
    expect(isLabelVariant('unknown')).toBe(false);
  });
});
