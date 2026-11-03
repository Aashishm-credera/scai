import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';

import { Default as HeadingTextRendering } from '@/components/features/PageContent/HeadingText/HeadingText';
import type { HeadingTextProps } from '@/components/features/PageContent/HeadingText/heading-text.props';
import { Default as SubHeadingTextRendering } from '@/components/features/PageContent/SubHeadingText/SubHeadingText';
import type { SubHeadingTextRenderingProps } from '@/components/features/PageContent/SubHeadingText/sub-heading-text.props';

const createPage = (isEditing: boolean): HeadingTextProps['page'] => ({
  layout: {} as HeadingTextProps['page']['layout'],
  locale: 'en',
  mode: {
    name: isEditing ? LayoutServicePageState.Edit : LayoutServicePageState.Normal,
    designLibrary: { isVariantGeneration: false },
    isNormal: !isEditing,
    isPreview: false,
    isEditing,
    isDesignLibrary: false,
  },
});

const createHeadingProps = (isEditing: boolean, value: string): HeadingTextProps => ({
  rendering: {} as HeadingTextProps['rendering'],
  params: {},
  page: createPage(isEditing),
  fields: { data: { datasource: { Heading: { value } } } },
});

const createSubHeadingProps = (
  isEditing: boolean,
  value: string
): SubHeadingTextRenderingProps => ({
  rendering: {} as SubHeadingTextRenderingProps['rendering'],
  params: {},
  page: createPage(isEditing),
  fields: { data: { datasource: { SubHeading: { value } } } },
});

describe('heading Sitecore renderings', () => {
  it('renders a long heading in Page Builder without a length hint', () => {
    const html = renderToStaticMarkup(
      <HeadingTextRendering
        {...createHeadingProps(true, 'a'.repeat(26))}
        params={{ RenderingIdentifier: 'sitecore-heading', styles: 'mb-4' }}
      />
    );

    expect(html).not.toContain('longer than 25 characters');
    expect(html).toContain('<h2');
    expect(html).toContain('id="sitecore-heading"');
    expect(html).toContain('mb-4');
  });

  it('sanitizes published heading markup while preserving superscript and subscript', () => {
    const html = renderToStaticMarkup(
      <HeadingTextRendering
        {...createHeadingProps(false, 'A <strong>bold</strong> <sup>®</sup><sub>2</sub>')}
      />
    );

    expect(html).toContain('A bold <sup>®</sup><sub>2</sub>');
    expect(html).not.toContain('<strong>');
  });

  it('renders a long subheading in Page Builder without a length hint', () => {
    const html = renderToStaticMarkup(
      <SubHeadingTextRendering {...createSubHeadingProps(true, 'a'.repeat(121))} />
    );

    expect(html).not.toContain('longer than 120 characters');
    expect(html).toContain('<h3');
  });
});
