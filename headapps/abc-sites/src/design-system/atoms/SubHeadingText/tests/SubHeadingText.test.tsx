import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SubHeadingText, type SubHeadingProps } from '@/design-system/atoms/SubHeadingText';

const createProps = (value: string, overrides: Partial<SubHeadingProps> = {}): SubHeadingProps => ({
  SubHeadingField: { value },
  isEditing: false,
  ...overrides,
});

const render = (props: SubHeadingProps) => renderToStaticMarkup(<SubHeadingText {...props} />);

describe('SubHeadingText', () => {
  it('renders a semantic h3 with the verified Figma typography and color tokens', () => {
    const html = render(
      createProps('Section heading goes here', { className: 'author-layout-class' })
    );

    expect(html).toContain('<h3');
    expect(html).toContain('>Section heading goes here</h3>');
    expect(html).toContain('text-[length:var(--abc-font-size-heading-sm)]');
    expect(html).toContain('text-[color:var(--abc-text-default-primary)]');
    expect(html).toContain('break-words');
    expect(html).not.toContain('wrap-anywhere');
    expect(html).toContain('whitespace-pre-line');
    expect(html).not.toContain('text-pretty');
    expect(html).toContain('author-layout-class');
  });

  it('renders nothing for empty published content', () => {
    expect(render(createProps(''))).toBe('');
  });

  it('renders the compatible Content SDK Rich Text field', () => {
    expect(render(createProps('Content SDK field'))).toContain('Content SDK field');
  });

  it('renders long content without frontend length validation', () => {
    const longer = 'a'.repeat(200);

    const html = render(createProps(longer, { isEditing: true }));
    expect(html).toContain(longer);
    expect(html).not.toContain('characters');
  });

  it('passes the Sitecore field markup through in published and editing modes', () => {
    const backendSanitized = 'Heart<sup>®</sup>';

    expect(render(createProps(backendSanitized))).toContain(backendSanitized);
    expect(render(createProps(backendSanitized, { isEditing: true }))).toContain(backendSanitized);
  });

  it('renders an empty field for Page Builder authors', () => {
    expect(() => render(createProps('', { isEditing: true }))).not.toThrow();
  });
});
