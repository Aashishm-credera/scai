import { renderToStaticMarkup } from 'react-dom/server';
import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { describe, expect, it, vi } from 'vitest';
import { Default as BaseImage } from '@/components/features/Media/BaseImage/BaseImage';
import type { BaseImageProps } from '@/components/features/Media/BaseImage/base-image.props';

// NextImage reads the Sitecore context, which a static render does not have. Alignment is on the
// figure around it, so a plain <img> is enough here.
vi.mock('@sitecore-content-sdk/nextjs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@sitecore-content-sdk/nextjs')>()),
  // eslint-disable-next-line @next/next/no-img-element -- stands in for NextImage
  NextImage: ({ alt }: { alt?: string }) => <img alt={alt} />,
}));

const createProps = (styles?: string): BaseImageProps => ({
  rendering: { componentName: 'Image' },
  params: { ...(styles === undefined ? {} : { styles }), RenderingIdentifier: 'image' },
  fields: {
    Image: { value: { src: '/images/sample.jpg', alt: 'Sample', width: 1600, height: 1000 } },
  },
  page: {
    layout: {} as BaseImageProps['page']['layout'],
    locale: 'en',
    mode: {
      name: LayoutServicePageState.Normal,
      designLibrary: { isVariantGeneration: false },
      isNormal: true,
      isPreview: false,
      isEditing: false,
      isDesignLibrary: false,
    },
  },
});

const figureClass = (props: BaseImageProps) =>
  renderToStaticMarkup(<BaseImage {...props} />).match(/<figure[^>]*class="([^"]*)"/)?.[1] ?? '';

describe('Sitecore BaseImage', () => {
  // Pages swaps the style class on the figure without re-rendering, so the layout must key off the
  // class rather than be picked from params.styles at render time.
  it.each(['left', 'right', 'center'])('passes image-align-%s from params.styles', (alignment) => {
    const classes = figureClass(createProps(`layout-class image-align-${alignment}`)).split(' ');
    expect(classes).toEqual(
      expect.arrayContaining(['component', `image-align-${alignment}`, 'layout-class'])
    );
  });

  it('carries the layout for every alignment, whichever style is picked', () => {
    const classes = figureClass(createProps('image-align-left')).split(' ');
    for (const alignment of ['left', 'right', 'center']) {
      expect(classes).toContain(`lg:[&amp;.image-align-${alignment}]:w-1/2`);
    }
  });

  it.each([undefined, '', 'layout-class'])('defaults to full width when styles is %s', (styles) => {
    expect(figureClass(createProps(styles)).split(' ')).toContain('image-align-full');
  });
});
