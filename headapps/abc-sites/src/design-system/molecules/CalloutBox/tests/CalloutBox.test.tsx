import type { RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CalloutBox, type ContentSdkLinkField } from '@/design-system/molecules/CalloutBox';

const title: TextField = { value: 'Important information' };
const description: RichTextField = {
  value:
    '<p>Read the <a href="/heart-health">heart health guide</a> for more information.</p><p><strong>Talk to your doctor</strong> if you have questions.</p><ul><li>First item</li></ul><ol><li>Second item</li></ol>',
};
const linkField: ContentSdkLinkField = {
  value: {
    href: '/heart-health',
    linktype: 'internal',
    text: 'Learn more',
  },
};

function renderCallout(
  props: Partial<{
    Icon: string;
    id: string;
    LinkField: ContentSdkLinkField;
    TitleField: TextField;
    DescriptionField: RichTextField | null;
    styles: string;
    isPageEditing: boolean;
  }> = {}
) {
  return renderToStaticMarkup(
    <CalloutBox
      Icon="interface/general/heart"
      LinkField={linkField}
      TitleField={title}
      DescriptionField={description}
      {...props}
    />
  );
}

describe('CalloutBox', () => {
  it('renders the configured Sitecore fields and keeps title, description, and CTA in DOM order', () => {
    const html = renderCallout();

    expect(html).toContain('<h3');
    expect(html).toContain('Important information');
    expect(html).toContain('<p>Read the <a href="/heart-health">heart health guide</a>');
    expect(html).toContain('<strong>Talk to your doctor</strong>');
    expect(html).toContain('<ul><li>First item</li></ul>');
    expect(html).toContain('<ol><li>Second item</li></ol>');
    expect(html).toContain('tertiary-button');
    expect(html).toContain('href="/heart-health"');
    expect(html).toContain('Learn more');
    expect(html.indexOf('<h3')).toBeLessThan(html.indexOf('<p>'));
    expect(html.indexOf('</ol>')).toBeLessThan(html.indexOf('tertiary-button'));
  });

  it.each([undefined, '', ' ', '\n\t'])(
    'omits missing, empty, or whitespace-only icons (%s)',
    (Icon) => {
      const html = renderCallout({ Icon });

      expect(html).not.toContain('data-abc-icon=');
      expect(html).not.toContain('aria-hidden="true"');
      expect(html).toContain('Important information');
    }
  );

  it.each([undefined, { value: '' }, { value: ' \n\t ' }])(
    'omits a missing, empty, or whitespace-only title (%s)',
    (TitleField) => {
      const html = renderCallout({ TitleField });

      expect(html).not.toContain('<h3');
      expect(html).not.toContain('Important information');
      expect(html).toContain('Read the');
    }
  );

  it.each([undefined, null, { value: '' }, { value: ' \n ' }])(
    'omits missing or empty rich-text descriptions (%s)',
    (DescriptionField) => {
      const html = renderCallout({ DescriptionField });

      expect(html).not.toContain('Read the');
      expect(html).not.toContain('<p');
      expect(html).toContain('Learn more');
    }
  );

  it('renders a decorative icon as hidden from assistive technology', () => {
    const html = renderCallout({ LinkField: undefined, DescriptionField: null });

    expect(html).toContain('data-abc-icon="interface/general/heart"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
    expect(html).toContain('data-size="xl"');
    expect(html).toContain('size-[var(--abc-icon-size-xl)]');
  });

  it('keeps the description when the optional CTA is absent', () => {
    const html = renderCallout({ LinkField: undefined });

    expect(html).toContain('Read the');
    expect(html).not.toContain('tertiary-button');
  });

  it('keeps empty fields editable in Page Builder', () => {
    const html = renderCallout({
      id: 'callout-example',
      LinkField: { value: { href: '', text: '' } },
      TitleField: { value: '' },
      DescriptionField: { value: '' },
      isPageEditing: true,
    });

    expect(html).toContain('id="callout-example"');
    expect(html).toContain('Add callout link');
    expect(html).toContain('tertiary-button');
  });

  it('uses the available neutral title and body design tokens', () => {
    const html = renderCallout();

    expect(html).toContain('bg-abc-surface-default-secondary');
    expect(html).toContain('text-abc-text-default-primary');
    expect(html).toContain('text-(--abc-text-default-secondary)');
    expect(html).toContain('!text-abc-text-default-primary');
    expect(html).toContain('!text-heading-xs');
    expect(html).toContain('!leading-(--abc-font-line-height-heading-xs)');
    expect(html).toContain('text-body-md');
    expect(html).toContain('text-pretty');
  });

  it('uses the Figma responsive widths and spacing tokens', () => {
    const html = renderCallout();

    expect(html).toContain('max-w-[485px]');
    expect(html).toContain('md:max-w-[756px]');
    expect(html).toContain('xl:max-w-[924px]');
    expect(html).toContain('gap-abc-spacing-gap-sm');
    expect(html).toContain('px-abc-spacing-inset-lg');
    expect(html).toContain('min-h-abc-buttons-height-md');
    expect(html).toContain('px-abc-spacing-inset-xl');
    expect(html).toContain('py-abc-spacing-inset-lg');
    expect(html).not.toContain('py-abc-spacing-inset-md');
  });

  it.each([
    [
      'callout-title-negative',
      'in-[.callout-title-negative]:bg-abc-feedback-error-bg-primary',
      'in-[.callout-title-negative]:text-abc-feedback-error-text-primary',
    ],
    [
      'callout-title-success',
      'in-[.callout-title-success]:bg-abc-feedback-success-bg-primary',
      'in-[.callout-title-success]:text-abc-feedback-success-text-primary',
    ],
  ])('applies the %s title treatment', (styles, backgroundClass, textClass) => {
    const html = renderCallout({ styles });

    expect(html).toContain(backgroundClass);
    expect(html).toContain(textClass);
    expect(html).toContain('text-(--abc-text-default-secondary)');
  });

  it('renders a CTA only for a configured, safe link field through the shared Button', () => {
    const valid = renderCallout({ LinkField: linkField });
    const incomplete = renderCallout({ LinkField: { value: { href: '/heart-health' } } });
    const unsafe = renderCallout({
      LinkField: { value: { href: 'javascript:alert(1)', text: 'Unsafe' } },
    });

    expect(valid).toContain('tertiary-button');
    expect(valid).toContain('href="/heart-health"');
    expect(valid).toContain('data-icon-name="interface/arrows/arrow-right"');
    expect(valid).toContain('button-icon-right');
    expect(incomplete).not.toContain('tertiary-button');
    expect(unsafe).not.toContain('tertiary-button');
    expect(unsafe).not.toContain('javascript:');
  });

  it('uses the responsive Label/md typography token for the CTA', () => {
    const ctaClassName = /<a class="([^"]*tertiary-button[^"]*)"[^>]*>Learn more<\/a>/.exec(
      renderCallout()
    )?.[1];

    expect(ctaClassName).toContain('!text-label-md');
    expect(ctaClassName).not.toMatch(/\b(?:sm|md|lg|xl):/);
  });

  it('collapses all optional content when no usable field is supplied', () => {
    expect(
      renderToStaticMarkup(
        <CalloutBox
          Icon=""
          LinkField={{ value: { href: '', text: ' ' } }}
          TitleField={{ value: '  ' }}
          DescriptionField={{ value: '  ' }}
        />
      )
    ).toBe('');
  });

  it('keeps long text wrapping enabled without truncation utilities', () => {
    const longTitle: TextField = { value: 'Long title '.repeat(30) };
    const longDescription: RichTextField = {
      value: `<p>${'long-word-without-spaces'.repeat(30)} https://example.com/${'path-segment-'.repeat(20)}</p>`,
    };
    const html = renderCallout({
      TitleField: longTitle,
      DescriptionField: longDescription,
    });

    expect(html).toContain(longTitle.value);
    expect(html).toContain(longDescription.value?.slice(3, 40));
    expect(html).toContain('[overflow-wrap:anywhere]');
    expect(html).not.toMatch(/\b(?:truncate|line-clamp-\d+)\b/);
  });

  it('preserves compatible caller styles while keeping required layout classes', () => {
    const html = renderCallout({ styles: 'custom-callout px-0' });

    expect(html).toContain('custom-callout');
    expect(html).toContain('rounded-(--abc-radius-lg)');
    expect(html).toContain('px-(--abc-spacing-inset-lg)');
  });
});
