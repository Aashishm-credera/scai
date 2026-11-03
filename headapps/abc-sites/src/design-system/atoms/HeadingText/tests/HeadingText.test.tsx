import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { HeadingText, type HeadingTextProps } from '@/design-system/atoms/HeadingText';

const createProps = (
  value: string,
  overrides: Partial<HeadingTextProps> = {}
): HeadingTextProps => ({
  HeadingField: { value },
  isEditing: false,
  ...overrides,
});

const render = (props: HeadingTextProps) => renderToStaticMarkup(<HeadingText {...props} />);

describe('HeadingText', () => {
  it('renders an h2 with responsive heading-lg typography and a readable content width', () => {
    const text = 'A long heading that wraps instead of truncating';
    const html = render(createProps(text, { className: 'author-layout-class' }));

    expect(html).toContain(`<h2`);
    expect(html).toContain(`>${text}</h2>`);
    expect(html).toContain('text-abc-text-default-primary');
    expect(html).toContain('text-heading-lg');
    expect(html).toContain('max-w-abc-layout-container-max-width-reading');
    expect(html).toContain('wrap-anywhere');
    expect(html).toContain('text-pretty');
    expect(html).toContain('author-layout-class');
  });

  it('renders nothing for empty published content', () => {
    expect(render(createProps(''))).toBe('');
  });

  it('renders long content without frontend length validation', () => {
    const longer = 'a'.repeat(200);
    const html = render(createProps(longer, { isEditing: true }));

    expect(html).toContain(longer);
    expect(html).not.toContain('characters');
  });

  it('passes the Sitecore field markup through in published and editing modes', () => {
    const backendSanitized = 'Heart<sup>®</sup><sub>2</sub>';

    expect(render(createProps(backendSanitized))).toContain(backendSanitized);
    expect(render(createProps(backendSanitized, { isEditing: true }))).toContain(backendSanitized);
  });

  it('renders an empty field for Page Builder authors', () => {
    expect(() => render(createProps('', { isEditing: true }))).not.toThrow();
  });
});
