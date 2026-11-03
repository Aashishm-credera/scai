import type { RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EmergencyCallout } from '@/design-system/molecules/EmergencyCallout';

const title: TextField = { value: 'Call emergency services immediately' };
const description: RichTextField = {
  value:
    '<p>If someone is unresponsive and not breathing normally, call for <strong>emergency help</strong>.</p>',
};

function render(
  props: Partial<{
    Icon: string;
    id: string;
    TitleField: TextField | null;
    DescriptionField: TextField | null;
    className: string;
    isPageEditing: boolean;
  }> = {}
) {
  return renderToStaticMarkup(
    <EmergencyCallout
      Icon="interface/alerts-feedback/alert-circle"
      TitleField={title}
      DescriptionField={description}
      {...props}
    />
  );
}

describe('EmergencyCallout', () => {
  it('renders the decorative icon, title, and description as readable text', () => {
    const html = render();

    expect(html).toContain('data-abc-icon="interface/alerts-feedback/alert-circle"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('<h3');
    expect(html).toContain(title.value);
    expect(html).toContain('<div');
    expect(html).toContain('<p>');
    expect(html).toContain('<strong>emergency help</strong>');
    expect(html).not.toContain('role="img"');
  });

  it('preserves long title and description text without truncation classes', () => {
    const longTitle: TextField = { value: 'Emergency guidance '.repeat(24) };
    const longDescription: RichTextField = {
      value: `<p>${'Stay with the person and follow the dispatcher instructions. '.repeat(40)}</p>`,
    };
    const html = render({
      TitleField: longTitle,
      DescriptionField: longDescription,
    });

    expect(html).toContain(longTitle.value);
    expect(html).toContain('Stay with the person and follow the dispatcher instructions.');
    expect(html).toContain('wrap-anywhere');
    expect(html).not.toMatch(/\b(?:truncate|line-clamp-\d+)\b/);
    expect(html).not.toMatch(/<(?:a|button)\b/);
  });

  it.each([undefined, '', ' ', '\n\t'])(
    'passes an empty icon through to the icon renderer (%s)',
    (Icon) => {
      const html = render({ Icon });

      expect(html).not.toContain('data-abc-icon=');
      expect(html).not.toContain('aria-hidden="true"');
      expect(html).toContain(title.value);
    }
  );

  it('renders the provided field components without validating their values', () => {
    const fields = {
      Icon: '',
      TitleField: { value: '' },
      DescriptionField: { value: '' },
    };

    const html = renderToStaticMarkup(<EmergencyCallout {...fields} />);

    expect(html).toContain('<section');
  });

  it('uses abc feedback and typography tokens with responsive text wrapping', () => {
    const html = render();

    expect(html).toContain('border-abc-feedback-error-border-subtle');
    expect(html).toContain('bg-abc-feedback-error-bg-primary');
    expect(html).toContain('text-abc-feedback-error-text-primary');
    expect(html).toContain('text-(length:--abc-font-size-label-md)');
    expect(html).toContain('leading-(--abc-font-line-height-label-md)');
    expect(html).toContain('text-(length:--abc-font-size-text-sm)');
    expect(html).toContain('leading-(--abc-font-line-height-text-sm)');
    expect(html).toContain('min-w-0');
    expect(html).toContain('flex-row');
    expect(html).toContain('whitespace-normal');
    expect(html).toContain('min-h-abc-size-lg');
    expect(html).toContain('max-w-abc-layout-width-640');
    expect(html).toContain('rounded-abc-radius-xl');
    expect(html).toContain('p-abc-spacing-inset-xl');
  });

  it('does not render an emergency phone CTA', () => {
    const html = render();

    expect(html).not.toContain('911');
    expect(html).not.toMatch(/<(?:a|button)\b/);
  });
});
