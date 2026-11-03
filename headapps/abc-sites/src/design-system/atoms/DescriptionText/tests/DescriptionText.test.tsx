import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DescriptionText, type DescriptionTextProps } from '..';

const render = (value: string, props: Partial<DescriptionTextProps> = {}) =>
  renderToStaticMarkup(<DescriptionText DescriptionField={{ value }} {...props} />);

describe('DescriptionText', () => {
  it('preserves paragraphs, inline formatting, and native ordered and unordered lists', () => {
    const value =
      '<p>Regular <strong>description</strong> copy.</p><ul><li>First bullet</li><li>Second bullet</li></ul><ol><li>First step</li><li>Second step</li></ol>';
    expect(render(value)).toContain(value);
  });

  it('keeps link text as the accessible name and retains internal and external destinations', () => {
    const html = render(
      '<p><a href="/heart-health">Heart health</a> <a href="https://www.heart.org" target="_blank" rel="noopener noreferrer">Visit abc</a></p>'
    );
    expect(html).toContain('<a href="/heart-health">Heart health</a>');
    expect(html).toContain(
      '<a href="https://www.heart.org" target="_blank" rel="noopener noreferrer">Visit abc</a>'
    );
    expect(html).not.toMatch(/aria-label|role=|tabindex/);
  });

  it('renders nothing for missing or empty published fields', () => {
    expect(renderToStaticMarkup(<DescriptionText />)).toBe('');
    for (const value of ['', ' ', '<p><br /></p>', '<p>&nbsp;</p>']) {
      expect(render(value)).toBe('');
    }
  });

  it('keeps authoring markup available for empty fields in editing mode', () => {
    expect(() => render('', { isEditing: true })).not.toThrow();
    expect(render('<p><br /></p>', { isEditing: true })).toContain('<p><br /></p>');
  });

  it('preserves long copy and forwards layout attributes without truncating content', () => {
    const value = `<p>${'Long description '.repeat(200)}</p>`;
    const html = render(value, { id: 'description', className: 'layout-class', lang: 'en' });
    expect(html).toContain(value);
    expect(html).toContain('id="description"');
    expect(html).toContain('layout-class');
    expect(html).toContain('lang="en"');
  });
});
