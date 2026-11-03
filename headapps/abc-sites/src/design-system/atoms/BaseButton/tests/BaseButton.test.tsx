import { LayoutServicePageState, type LinkField } from '@sitecore-content-sdk/nextjs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Default,
  Link,
  Secondary,
  Tertiary,
} from '@/components/features/Navigation/BaseButton/BaseButton';
import type { BaseButtonProps } from '@/components/features/Navigation/BaseButton/base-button.props';
import type { ComponentProps } from '@/lib/component-props';

const linkField: LinkField = {
  value: {
    href: '/donate',
    linktype: 'internal',
    text: 'Donate now',
  },
};

const page: ComponentProps['page'] = {
  layout: {
    sitecore: {
      context: {},
      route: null,
    },
  },
  locale: 'en',
  mode: {
    name: LayoutServicePageState.Normal,
    designLibrary: { isVariantGeneration: false },
    isNormal: true,
    isPreview: false,
    isEditing: false,
    isDesignLibrary: false,
  },
};

function renderingProps(overrides: Partial<BaseButtonProps> = {}): BaseButtonProps {
  return {
    rendering: {
      componentName: 'BaseButton',
    },
    fields: {
      Link: linkField,
      Icon: {
        name: 'arrow-right',
        url: '/sitecore/media-library/Icons/interface/arrows/arrow-right.svg?download=1',
        fields: {},
      },
    },
    params: { styles: 'button-icon-right' },
    ...overrides,
    page: overrides.page ?? page,
  };
}

describe('BaseButton rendering', () => {
  it.each([
    ['Default', Default, 'primary-button'],
    ['Secondary', Secondary, 'secondary-button'],
    ['Tertiary', Tertiary, 'tertiary-button'],
    ['Link', Link, 'link-button'],
  ] as const)('maps %s to its Button variant', (_name, Component, className) => {
    const html = renderToStaticMarkup(<Component {...renderingProps()} />);

    expect(html).toContain(className);
    expect(html).toContain('href="/donate"');
    expect(html).toContain('Donate now');
    expect(html).toContain('button-icon-right');
    expect(html).toContain('data-icon-name="interface/arrows/arrow-right"');
  });

  it('safely defaults missing styles and optional fields', () => {
    const html = renderToStaticMarkup(
      <Default
        {...renderingProps({
          fields: { Link: linkField },
          params: {},
        })}
      />
    );

    expect(html).toContain('primary-button');
    expect(html).not.toContain('data-icon-name=');
  });

  it('renders nothing when rendering fields are absent', () => {
    const props = renderingProps({
      fields: undefined,
      params: {},
    });

    expect(renderToStaticMarkup(<Default {...props} />)).toBe('');
  });

  it('ignores an icon item URL outside /icons/', () => {
    const html = renderToStaticMarkup(
      <Default
        {...renderingProps({
          fields: {
            Link: linkField,
            Icon: { name: 'icon', url: '/media/arrow-right.svg', fields: {} },
          },
        })}
      />
    );

    expect(html).not.toContain('data-icon-name=');
  });
});
