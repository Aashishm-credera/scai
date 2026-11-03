import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DetailPageLinksList } from '../DetailPageLinksList';
import type { DetailPageLinkItem } from '../detail-page-links-list.props';

const item: DetailPageLinkItem = {
  id: 'guide',
  link: { value: { href: '/guide' } },
  title: { value: 'Heart health' },
  description: { value: 'Learn about prevention.' },
};

describe('DetailPageLinksList', () => {
  it('escapes HTML in card text', () => {
    const html = renderToStaticMarkup(
      <DetailPageLinksList cards={[{ ...item, title: { value: '<script>alert(1)</script>' } }]} />
    );
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('renders an API heading field with superscript markup inside H3', () => {
    const html = renderToStaticMarkup(
      <DetailPageLinksList
        heading={{ value: 'Learn more about high blood pressure<sup>®</sup>' }}
        cards={[item]}
      />
    );
    expect(html).toMatch(/<h3[^>]*>Learn more about high blood pressure<sup>®<\/sup><\/h3>/);
    expect(html).not.toContain('&lt;sup&gt;');
  });

  it('renders nested API link, image, title, and description fields', () => {
    const cmsItem: DetailPageLinkItem = {
      id: '123123213',
      link: { value: { href: '/high-blood-pressure/black-adults' } },
      image: { value: { src: '/guide.png', alt: '', width: '580', height: '386' } },
      title: { value: 'High Blood Pressure among Black adults' },
      description: {
        value: 'Why high blood pressure affects Black adults more, and what you can do.',
      },
    };
    const html = renderToStaticMarkup(
      <DetailPageLinksList
        {...{
          id: 'learn-more',
          className: 'custom',
          heading: { value: 'Related guides' },
          cards: [cmsItem],
        }}
      />
    );
    expect(html).toContain('id="learn-more"');
    expect(html).toContain('custom');
    expect(html).toContain('href="/high-blood-pressure/black-adults"');
    expect(html).toContain('High Blood Pressure among Black adults');
    expect(html).toContain(
      'Why high blood pressure affects Black adults more, and what you can do.'
    );
    expect(html).toContain('data-nimg="1"');
    expect(html).toContain('url=%2Fguide.png');
    expect(html).toContain('width="580"');
    expect(html).toContain('height="386"');
    expect(html).toContain('alt=""');
    expect(html.match(/<a /g)).toHaveLength(1);
  });

  it('omits nested fields with a missing destination', () => {
    const cmsItem: DetailPageLinkItem = {
      id: 'missing-field-link',
      link: { value: {} },
      title: { value: 'Heart health' },
    };
    expect(renderToStaticMarkup(<DetailPageLinksList cards={[cmsItem]} />)).toBe('');
  });

  it('uses H3/H4 and one native navigation link around the complete card', () => {
    const html = renderToStaticMarkup(
      <DetailPageLinksList heading={{ value: 'Related guides' }} cards={[item]} />
    );
    expect(html).toMatch(/<h3[^>]*>Related guides<\/h3>/);
    expect(html).toMatch(/<h4[^>]*>Heart health<\/h4>/);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('href="/guide"');
    expect(html).not.toContain('aria-label=');
    expect(html).toContain('aria-hidden="true"');
  });

  it('places the image before the title and description and keeps the chevron decorative', () => {
    const html = renderToStaticMarkup(
      <DetailPageLinksList
        cards={[
          {
            ...item,
            image: { value: { src: '/guide.png', alt: 'A clinician discusses prevention' } },
          },
        ]}
      />
    );
    expect(html.indexOf('alt="A clinician')).toBeLessThan(html.indexOf('<h4'));
    expect(html).toContain('data-nimg="fill"');
    expect(html.indexOf('<h4')).toBeLessThan(html.indexOf('Learn about prevention.'));
    expect(html).toMatch(
      /aria-hidden="true"><span[^>]*aria-hidden="true"[^>]*data-abc-icon="interface\/arrows\/chevron-right"/
    );
  });

  it('preserves long Unicode titles and descriptions without truncating their contents', () => {
    const title = 'title — '.repeat(100);
    const description = 'LongUnbrokenText'.repeat(100);
    const html = renderToStaticMarkup(
      <DetailPageLinksList
        cards={[{ ...item, title: { value: title }, description: { value: description } }]}
      />
    );
    expect(html).toContain(title);
    expect(html).toContain(description);
  });

  it('omits unsafe or missing navigation destinations and empty publishing output', () => {
    expect(renderToStaticMarkup(<DetailPageLinksList cards={[]} />)).toBe('');
    expect(
      renderToStaticMarkup(
        <DetailPageLinksList
          cards={[
            { ...item, link: { value: { href: 'javascript:alert(1)' } } },
            { ...item, id: 'missing', link: undefined },
          ]}
        />
      )
    ).toBe('');
  });
});
