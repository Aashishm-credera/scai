import { renderToStaticMarkup } from 'react-dom/server';
import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { describe, expect, it } from 'vitest';
import { Default as DescriptionText } from '@/components/features/PageContent/DescriptionText/DescriptionText';
import type { DescriptionTextProps } from '@/components/features/PageContent/DescriptionText/description-text.props';

const value =
  '<p>Know the <a href="/heart-attack/warning-signs">warning signs</a> of a heart attack:</p><ul><li>Chest discomfort</li><li>Shortness of breath</li></ul>';

const createProps = (styles?: string, isEditing = false): DescriptionTextProps => ({
  rendering: { componentName: 'DescriptionText' },
  params: { ...(styles === undefined ? {} : { styles }), RenderingIdentifier: 'description' },
  fields: { Description: { value } },
  page: {
    layout: {} as DescriptionTextProps['page']['layout'],
    locale: 'en',
    mode: {
      name: isEditing ? LayoutServicePageState.Edit : LayoutServicePageState.Normal,
      designLibrary: { isVariantGeneration: false },
      isNormal: !isEditing,
      isPreview: false,
      isEditing,
      isDesignLibrary: false,
    },
  },
});

const render = (props: DescriptionTextProps) =>
  renderToStaticMarkup(<DescriptionText {...props} />);

describe('Sitecore DescriptionText', () => {
  it.each([
    ['l', 'lg'],
    ['m', 'md'],
    ['s', 'sm'],
  ])('reads size %s from params.styles with flat backend fields', (size, token) => {
    const html = render(createProps(`layout-class description-text-size-${size}`));
    expect(html).toContain(value);
    expect(html).toContain(`text-body-${token}`);
    expect(html).toContain('layout-class');
    expect(html).toContain('id="description"');
    expect(html).not.toMatch(/ size=| params=/);
  });

  it.each([undefined, '', 'layout-class', 'description-text-size-large'])(
    'defaults to medium when styles is %s',
    (styles) => {
      expect(render(createProps(styles))).toContain('text-body-md');
    }
  );

  it('continues to accept GraphQL-wrapped datasource fields', () => {
    const props = createProps('description-text-size-l');
    props.fields = { data: { datasource: { Description: { jsonValue: { value } } } } };
    expect(render(props)).toContain(value);
  });

  it('preserves published sanitization and link accessible names', () => {
    const props = createProps('description-text-size-s');
    props.fields = {
      Description: {
        value:
          '<p><a href="/safe" aria-label="Override">Visible link</a><script>bad()</script></p>',
      },
    };
    const html = render(props);
    expect(html).toContain('<a href="/safe">Visible link</a>');
    expect(html).not.toContain('aria-label');
    expect(html).not.toContain('<script>');
  });

  it('keeps missing datasource handling and editing warnings', () => {
    const missing = createProps();
    missing.fields = undefined;
    expect(render(missing)).toBe('');
    const editing = createProps('description-text-size-l', true);
    editing.fields = undefined;
    expect(render(editing)).toContain('Missing Description Text Datasource');
    editing.fields = { Description: { value: '<p><a href="javascript:bad()">Link</a></p>' } };
    expect(render(editing)).toContain('A link has a destination that is not allowed');
  });
});
