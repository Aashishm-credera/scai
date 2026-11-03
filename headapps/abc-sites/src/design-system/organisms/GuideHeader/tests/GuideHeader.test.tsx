import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ParallaxBackdrop } from '@/design-system/atoms/ParallaxBackdrop';
import { abcIcon } from '@/design-system/design/icons';
import {
  GuideHeader,
  type GuideHeaderPresentation,
} from '@/design-system/organisms/GuideHeader';

const image = (
  <ParallaxBackdrop
    className="h-[482px] w-full flex-none md:h-[622px] lg:absolute lg:inset-0 lg:h-[744px]"
    image={
      <img
        src="/media/guide.jpg"
        alt="A person checking their blood pressure"
        width="2400"
        height="900"
        style={{ objectPosition: '70% 50%' }}
      />
    }
  />
);

const presentation: GuideHeaderPresentation = {
  id: 'guide-header',
  className: 'author-class',
  metadata: {
    uid: 'rendering-uid',
    componentName: 'GuideHeader',
    dataSource: 'datasource-id',
  },
  image,
  title: 'High Blood Pressure Guide',
  description: 'A practical guide to understanding blood pressure.',
  status: {
    label: 'Medically verified',
    date: 'May 2027',
    icon: <abcIcon name="interface/general/check" size="sm" color="brand-primary" />,
  },
  updatedLabel: 'Updated',
};

describe('GuideHeader', () => {
  it('renders the semantic content, metadata, status, and composed parallax image slot', () => {
    const html = renderToStaticMarkup(
      <GuideHeader
        {...presentation}
        breadcrumbItems={[
          { title: 'Home', url: '/' },
          { title: 'Health information', url: '/health-information' },
          { title: 'Conditions', url: '/health-information/conditions' },
        ]}
      />
    );

    expect(html).toContain('<section id="guide-header" aria-labelledby=');
    expect(html).toContain('author-class');
    expect(html).toContain('data-rendering-uid="rendering-uid"');
    expect(html).toContain('<nav aria-label="Breadcrumb"');
    expect(html).toContain('>Health information</a>');
    expect(html).toContain('>Conditions</a>');
    expect(html).toContain('<h1');
    expect(html).toContain('>High Blood Pressure Guide</h1>');
    expect(html).toContain('A practical guide to understanding blood pressure.');
    expect(html).toContain('Medically verified • Updated May 2027');
    expect(html).toContain('data-abc-icon="interface/general/check"');
    expect(html).toContain('data-parallax-backdrop="true"');
    expect(html).toContain('alt="A person checking their blood pressure"');
    expect(html).toContain('width="2400"');
    expect(html).toContain('height="900"');
    expect(html).toContain('object-position:70% 50%');
  });

  it('collapses optional breadcrumb, status, icon, and date content', () => {
    const html = renderToStaticMarkup(
      <GuideHeader {...presentation} status={undefined} breadcrumbItems={undefined} />
    );

    expect(html).not.toContain('Breadcrumb');
    expect(html).not.toContain('Updated');
  });

  it('renders a label-only status without an icon or separator', () => {
    const html = renderToStaticMarkup(
      <GuideHeader {...presentation} status={{ label: 'Reviewed' }} />
    );

    expect(html).toContain('Reviewed');
    expect(html).not.toContain('data-abc-icon');
    expect(html).not.toContain('•');
  });

  it('does not invent an English update label when none is provided', () => {
    const html = renderToStaticMarkup(
      <GuideHeader
        {...presentation}
        status={{ label: 'Reviewed', date: 'may 2027' }}
        updatedLabel={undefined}
      />
    );

    expect(html).toContain('Reviewed • may 2027');
    expect(html).not.toContain('Updated');
  });

  it('preserves long title and description content and renders safely without an image', () => {
    const title = 'Long title '.repeat(20).trim();
    const description = 'Long description '.repeat(30).trim();
    const html = renderToStaticMarkup(
      <GuideHeader {...presentation} image={undefined} title={title} description={description} />
    );

    expect(html).toContain(title);
    expect(html).toContain(description);
    expect(html).not.toContain('data-parallax-backdrop');
  });

  it('renders nothing when all primary content is absent', () => {
    expect(
      renderToStaticMarkup(
        <GuideHeader
          {...presentation}
          image={undefined}
          title={undefined}
          description={undefined}
        />
      )
    ).toBe('');
  });
});

describe('ParallaxBackdrop', () => {
  it('composes the image slot inside a cover frame', () => {
    const html = renderToStaticMarkup(
      <ParallaxBackdrop image={<img src="/media/no-size.jpg" alt="" />} />
    );

    expect(html).toContain('data-parallax-backdrop="true"');
    expect(html).toContain('src="/media/no-size.jpg"');
    expect(html).toContain('alt=""');
  });
});
