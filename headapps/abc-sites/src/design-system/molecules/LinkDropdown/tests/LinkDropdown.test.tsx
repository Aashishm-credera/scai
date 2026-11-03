import { tokens } from '@design-tokens/generated/tokens';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  LinkDropdown,
  LinkDropdownList,
  linkDropdownItemClassName,
  linkDropdownPopupClassName,
  linkDropdownTriggerClassName,
  type LinkDropdownItem,
} from '../LinkDropdown';
import { BreadcrumbExample } from '../stories/LinkDropdownGalleryParts';

// @ts-expect-error An item cannot provide both an href and a supplied link root.
const duplicateRoot: LinkDropdownItem = {
  id: 'bad',
  label: 'Bad',
  href: '/bad',
  link: <a href="#bad">Bad</a>,
};
// @ts-expect-error An item must provide either an href or a supplied link root.
const missingRoot: LinkDropdownItem = { id: 'bad', label: 'Bad' };
void duplicateRoot;
void missingRoot;

type BreadcrumbLink = {
  url: string;
  pageName: string;
};

const breadcrumbsLinks: readonly BreadcrumbLink[] = [
  { url: '/en', pageName: 'Home' },
  { url: '/en/healthy-living', pageName: 'Healthy Living' },
  { url: '/en/healthy-living/healthy-eating', pageName: 'Healthy Eating' },
];

function renderList(items: readonly LinkDropdownItem[]) {
  return renderToStaticMarkup(
    <LinkDropdownList
      items={items}
      navigationLabel="Hidden breadcrumb pages"
      onNavigate={() => undefined}
    />
  );
}

describe('LinkDropdown', () => {
  it('uses a native, labelled trigger with the shared Button link tokens', () => {
    const html = renderToStaticMarkup(
      <LinkDropdown
        id="breadcrumb-overflow"
        className="provider-wrapper"
        items={[{ id: 'heart', label: 'Heart health', href: '/heart-health' }]}
        triggerLabel="Show hidden breadcrumb pages"
      />
    );

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('data-slot="button-label"');
    expect(html).toContain(`class="${linkDropdownTriggerClassName} `);
    expect(html).toContain('link-dropdown-trigger-label min-w-0');
    expect(html).toContain('aria-label="Show hidden breadcrumb pages"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('id="breadcrumb-overflow"');
    expect(html).toContain('class="link-dropdown inline-flex provider-wrapper"');
    expect(html).not.toContain('<nav');
  });

  it('enables the default trigger only when valid destinations are available', () => {
    const empty = renderToStaticMarkup(
      <LinkDropdown items={[]} triggerLabel="Show hidden breadcrumb pages" />
    );
    const unsafe = renderToStaticMarkup(
      <LinkDropdown
        items={[{ id: 'unsafe', label: 'Unsafe', href: 'javascript:alert(1)' }]}
        triggerLabel="Show hidden breadcrumb pages"
      />
    );
    const available = renderToStaticMarkup(
      <LinkDropdown
        items={[{ id: 'heart', label: 'Heart health', href: '/heart-health' }]}
        triggerLabel="Show hidden breadcrumb pages"
      />
    );
    const disabledOpen = renderToStaticMarkup(
      <LinkDropdown
        defaultOpen
        disabled
        items={[{ id: 'heart', label: 'Heart health', href: '/heart-health' }]}
        triggerLabel="Show hidden breadcrumb pages"
      />
    );

    expect(empty).toContain('disabled=""');
    expect(unsafe).toContain('disabled=""');
    expect(available).not.toContain('disabled=""');
    expect(disabledOpen).not.toContain('role="dialog"');
  });

  it('renders a supplied trigger and applies the disabled prop to it', () => {
    const trigger = (
      <button type="button" data-testid="resource-trigger">
        Download resources
      </button>
    );
    const items = [{ id: 'guide', label: 'Guide', href: '/guide' }];
    const enabled = renderToStaticMarkup(
      <LinkDropdown items={items} trigger={trigger} triggerLabel="Download resources" />
    );
    const disabled = renderToStaticMarkup(
      <LinkDropdown disabled items={items} trigger={trigger} triggerLabel="Download resources" />
    );

    expect(enabled).toContain('data-testid="resource-trigger"');
    expect(enabled).toContain('>Download resources</button>');
    expect(enabled).not.toContain('data-slot="button-label"');
    expect(enabled).not.toContain('disabled=""');
    expect(disabled).toContain('disabled=""');
  });
});

describe('LinkDropdown breadcrumb story', () => {
  it('keeps small chevron separators outside the interactive text links', () => {
    const html = renderToStaticMarkup(
      <BreadcrumbExample navigationLabel="Accessible separator example" />
    );
    const separators = html.match(/<li[^>]*data-breadcrumb-separator=""[^>]*>.*?<\/li>/g);

    expect(html.match(/data-breadcrumb-link=""/g)).toHaveLength(2);
    expect(html.match(/<a\b/g)).toHaveLength(2);
    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(separators).toHaveLength(2);
    for (const separator of separators ?? []) {
      expect(separator).toContain('aria-hidden="true"');
      expect(separator).toContain('pointer-events-none');
      expect(separator).toContain('data-size="sm"');
      expect(separator).not.toContain('<a');
      expect(separator).not.toContain('<button');
    }
  });
});

describe('LinkDropdown links', () => {
  it('maps only the collapsed intermediary into a semantic native link', () => {
    const hiddenBreadcrumbLinks = breadcrumbsLinks.slice(1, -1);
    const items = hiddenBreadcrumbLinks.map(({ url, pageName }) => ({
      id: url,
      href: url,
      label: pageName,
    })) satisfies readonly LinkDropdownItem[];
    const html = renderList(items);
    const hrefs = [...html.matchAll(/<a[^>]*href="([^"]+)"/g)].map((match) => match[1]);

    expect(html).toContain(
      '<nav aria-label="Hidden breadcrumb pages" class="link-dropdown-navigation">'
    );
    expect(html).toContain('<ul');
    expect(html.match(/<li class="link-dropdown-list-item">/g)).toHaveLength(1);
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(hrefs).toEqual(['/en/healthy-living']);
    expect(html).toContain('>Healthy Living</span>');
    expect(html).not.toContain('>Home</span>');
    expect(html).not.toContain('>Healthy Eating</span>');
    expect(html).not.toContain('role="button"');
  });

  it('keeps a supplied link as the root and preserves provider attributes', () => {
    const html = renderList([
      {
        id: 'editable',
        label: <span data-editable-label="true">Editable label</span>,
        link: (
          <a
            className="provider-class"
            data-link-provider="sitecore"
            href="https://www.heart.org"
            rel="sponsored"
            target="_blank"
          >
            Provider placeholder
          </a>
        ),
      },
    ]);

    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain('href="https://www.heart.org"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="sponsored noopener noreferrer"');
    expect(html).toContain('data-link-provider="sitecore"');
    expect(html).toContain('data-editable-label="true"');
    expect(html).toContain('provider-class');
    expect(html).not.toContain('Provider placeholder');
  });

  it.each([
    '/heart-health',
    '?topic=stroke',
    '#prevention',
    'http://example.org',
    'https://example.org',
    'tel:+18002428721',
    'mailto:help@example.org',
  ])('allows the safe destination %s', (href) => {
    expect(renderList([{ id: href, label: 'Destination', href }])).toContain(`href="${href}"`);
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,unsafe',
    '//example.org/path',
    'https://example.org\\path',
    'https://exa\nmple.org',
    'http://[',
  ])('rejects the unsafe or malformed destination %s', (href) => {
    expect(renderList([{ id: href, label: 'Unsafe', href }])).not.toContain('<a');
  });

  it('keeps internal links in the current context', () => {
    const html = renderList([
      { id: 'internal', label: 'Internal', href: '/heart-health', target: '_blank' },
    ]);

    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain('noopener');
  });

  it('secures external links opened in a new context', () => {
    const html = renderList([
      {
        id: 'external',
        label: 'Heart.org',
        href: 'https://www.heart.org',
        rel: 'nofollow',
        target: '_blank',
      },
    ]);

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="nofollow noopener noreferrer"');
  });
});

describe('LinkDropdown presentation', () => {
  it('exposes the stable semantic component hooks', () => {
    const html = renderList([{ id: 'spacing', label: 'Spacing', href: '/spacing' }]);

    expect(linkDropdownTriggerClassName).toBe('link-dropdown-trigger');
    expect(linkDropdownPopupClassName).toBe('link-dropdown-popup');
    expect(linkDropdownItemClassName).toBe('link-dropdown-item');
    expect(html).toContain('class="link-dropdown-navigation"');
    expect(html).toContain('class="link-dropdown-list ');
    expect(html).toContain('class="link-dropdown-list-item"');
    expect(html).toContain('class="link-dropdown-item ');
    expect(html).toContain('class="link-dropdown-item-content ');
  });
});

const AA_NORMAL_TEXT_RATIO = 4.5;
const UI_COMPONENT_RATIO = 3;

function relativeLuminance(color: string) {
  const channels = [1, 3, 5].map(
    (start) => Number.parseInt(color.slice(start, start + 2), 16) / 255
  );
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

describe('LinkDropdown color contrast', () => {
  it.each([
    ['default', tokens.color.neutral['900'], tokens.color.base.white],
    ['hover', tokens.color.neutral['900'], tokens.color.neutral['50']],
    ['focus', tokens.color.neutral['900'], tokens.color.base.white],
  ])('%s text meets WCAG AA', (_state, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_RATIO);
  });

  it('uses a focus-ring boundary with sufficient adjacent contrast', () => {
    expect(
      contrastRatio(tokens.color.brand.primary['500'], tokens.color.base.white)
    ).toBeGreaterThanOrEqual(UI_COMPONENT_RATIO);
  });
});
