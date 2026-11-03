import type { FieldMetadata, LinkField } from '@sitecore-content-sdk/nextjs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button, type ButtonProps } from '@/design-system/atoms/BaseButton';
import { iconDefinitions } from '@/design-system/design/icons';
import {
  getIconHierarchyLabel,
  sortIconIdsByHierarchy,
} from '@/design-system/design/icons/stories/filter-icons';
import { ButtonDocumentation } from './ButtonDocumentation';

const VARIANTS = ['primary', 'secondary', 'tertiary', 'link'] as const;
const ICON = 'interface/arrows/arrow-right';
const SHORT_LABEL = 'Button label';
const MAX_LENGTH_LABEL = 'Button text goes here max 34 chars';
type PageBuilderLinkField = LinkField & FieldMetadata;
const SITECORE_LINK_FIELD: LinkField = {
  value: {
    linktype: 'internal',
    id: '757bb7d0-d96f-48aa-93be-2b072ac93226',
    anchor: '',
    querystring: '',
    target: '',
    class: '',
    text: 'Go to Home',
    title: '',
    href: '/en/',
  },
};
const PAGE_BUILDER_LINK_FIELD: PageBuilderLinkField = {
  ...SITECORE_LINK_FIELD,
  metadata: {},
};
const UPDATED_SITECORE_LINK_FIELD: PageBuilderLinkField = {
  metadata: {},
  value: {
    linktype: 'external',
    anchor: '',
    querystring: '',
    target: '_blank',
    class: '',
    text: 'Find a CPR class',
    title: '',
    href: 'https://www.heart.org/en/cpr',
  },
};

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      // Axe cannot read text contrast over the separate gradient surface layer. Those token pairs
      // are covered by tests/ButtonContrast.test.ts instead.
      config: {
        rules: [{ id: 'color-contrast', enabled: false }],
      },
    },
    docs: {
      description: {
        component: `Button renders one navigation anchor from either a Sitecore General Link field or a plain link object. A valid linkField takes priority when both sources are supplied.

The variant selects its Tailwind classes and adds a primary-button, secondary-button, tertiary-button, or link-button hook. button-icon-right in styles moves the icon after the label. The label is the anchor's only child, so Page builder can edit the link text in place; the gradient surface of primary and secondary, the icon and the loading spinner are pseudo-elements, and the visible label is the accessible name. Invalid destinations render nothing.`,
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type SupportedVariant = (typeof VARIANTS)[number];
type IconArrangement = 'left' | 'right' | 'none';

function GalleryButton({
  arrangement,
  label,
  variant,
}: {
  arrangement: IconArrangement;
  label: string;
  variant: SupportedVariant;
}) {
  return (
    <Button
      variant={variant}
      link={{ url: '#button-gallery', title: label }}
      icon={arrangement === 'none' ? undefined : ICON}
      styles={arrangement === 'right' ? 'button-icon-right' : ''}
    />
  );
}

function GallerySection({ variant }: { variant: SupportedVariant }) {
  return (
    <section aria-labelledby={`${variant}-gallery-heading`} className="grid min-w-0 gap-8">
      <h2 id={`${variant}-gallery-heading`} className="text-heading-xs capitalize">
        {variant}
      </h2>
      <div className="flex flex-wrap items-center gap-10">
        <GalleryButton variant={variant} label={SHORT_LABEL} arrangement="right" />
        <GalleryButton variant={variant} label={SHORT_LABEL} arrangement="left" />
        <GalleryButton variant={variant} label={SHORT_LABEL} arrangement="none" />
        <GalleryButton variant={variant} label={MAX_LENGTH_LABEL} arrangement="right" />
        <GalleryButton variant={variant} label={MAX_LENGTH_LABEL} arrangement="left" />
        <GalleryButton variant={variant} label={MAX_LENGTH_LABEL} arrangement="none" />
      </div>
    </section>
  );
}

function StateGallery() {
  return (
    <section aria-labelledby="button-states-heading" className="grid min-w-0 gap-8">
      <div className="grid gap-2">
        <h2 id="button-states-heading" className="text-heading-xs">
          States and responsive sizing
        </h2>
        <p>
          Switch the Storybook viewport toolbar between Mobile, Tablet, Desktop, and Large to see
          the Figma token values for type, spacing, height, radius, elevation, and icon size.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-10">
        <Button
          disabled
          icon={ICON}
          link={{ url: '#button-gallery', title: 'Primary action' }}
          styles="button-icon-left"
          variant="primary"
        />
        <Button
          isLoading
          icon={ICON}
          link={{ url: '#button-gallery', title: 'Primary action' }}
          styles="button-icon-right"
          variant="primary"
        />
        <Button
          disabled
          icon={ICON}
          link={{ url: '#button-gallery', title: 'Secondary action' }}
          styles="button-icon-left"
          variant="secondary"
        />
        <Button
          isLoading
          icon={ICON}
          link={{ url: '#button-gallery', title: 'Secondary action' }}
          styles="button-icon-right"
          variant="secondary"
        />
        <Button
          isCurrent
          icon={ICON}
          link={{ url: '#button-gallery', title: 'Secondary selected' }}
          styles="button-icon-left"
          variant="secondary"
        />
        <Button
          disabled
          icon={ICON}
          link={{ url: '#button-gallery', title: 'Tertiary action' }}
          styles="button-icon-left"
          variant="tertiary"
        />
        <Button
          disabled
          icon={ICON}
          link={{ url: '#button-gallery', title: 'Link action' }}
          styles="button-icon-left"
          variant="link"
        />
      </div>
    </section>
  );
}

function LinkSourceGallery() {
  return (
    <section aria-labelledby="button-link-sources-heading" className="grid min-w-0 gap-8">
      <h2 id="button-link-sources-heading" className="text-heading-xs">
        Link sources
      </h2>
      <div className="flex flex-wrap items-center gap-10">
        <Button
          icon={ICON}
          linkField={SITECORE_LINK_FIELD}
          styles="button-icon-right"
          variant="primary"
        />
        <Button
          icon={ICON}
          link={{ url: '/heart-health', title: 'Heart health', target: '_self' }}
          styles="button-icon-left"
          variant="secondary"
        />
      </div>
    </section>
  );
}

export const Gallery: StoryObj = {
  render: () => (
    <div id="button-gallery" className="grid gap-y-16 bg-white p-8">
      {VARIANTS.map((variant) => (
        <GallerySection key={variant} variant={variant} />
      ))}
      <StateGallery />
      <LinkSourceGallery />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const variant of VARIANTS) {
      const section = within(canvas.getByRole('region', { name: variant }));
      const links = section.getAllByRole('link');

      await expect(links).toHaveLength(6);
      for (const link of links.slice(0, 3)) {
        await expect(link.className).toContain(`${variant}-button`);
      }
      await expect(links[0].classList.contains('button-icon-right')).toBe(true);
      await expect(links[1].classList.contains('button-icon-right')).toBe(false);

      // The label is each anchor's only child: Page builder replaces the children of a Link
      // field when an author edits its text. Surface, icon and spinner are pseudo-elements.
      for (const link of links) {
        await expect(link.childElementCount).toBe(0);
      }
      await expect(links[0]).toHaveAttribute('data-icon-name', ICON);
      await expect(links[2]).not.toHaveAttribute('data-icon-name');
      await expect(getComputedStyle(links[0], '::after').maskImage).toContain(
        '/icons/interface/arrow-right.svg'
      );
      await expect(getComputedStyle(links[2], '::after').maskImage).toBe('none');
      // ::after follows the text: row puts a right icon after it, row-reverse a left one before it.
      await expect(getComputedStyle(links[0]).flexDirection).toBe('row');
      await expect(getComputedStyle(links[1]).flexDirection).toBe('row-reverse');

      const surface = getComputedStyle(links[0], '::before');
      if (variant === 'primary' || variant === 'secondary') {
        await expect(surface.backgroundImage).not.toBe('none');
        await expect(surface.boxShadow).not.toBe('none');
      } else {
        await expect(surface.content).toBe('none');
      }
      if (variant === 'tertiary') {
        await expect(getComputedStyle(links[2]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await userEvent.hover(links[1]);
        await expect(getComputedStyle(links[1]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await userEvent.unhover(links[1]);
      }
      await expect(links[0].textContent).toBe(SHORT_LABEL);
      await expect(getComputedStyle(links[0]).whiteSpace).toBe('normal');
    }

    // JC's Page builder report: editing the link text replaces the anchor's children with the new
    // text. The surface and icon must survive that, which they do because neither is a child.
    const edited = within(canvas.getByRole('region', { name: 'primary' })).getAllByRole('link')[0];
    edited.textContent = 'Edited in Page builder';
    await expect(getComputedStyle(edited, '::before').backgroundImage).not.toBe('none');
    await expect(getComputedStyle(edited, '::after').maskImage).toContain(
      '/icons/interface/arrow-right.svg'
    );
    edited.textContent = SHORT_LABEL;

    const states = within(canvas.getByRole('region', { name: 'States and responsive sizing' }));
    const disabledLink = states.getByRole('link', { name: 'Primary action, disabled' });
    const loadingLinks = states.getAllByRole('link', { name: 'Loading' });
    const loadingLink = loadingLinks[0];
    const selectedLink = states.getByRole('link', { name: 'Secondary selected' });

    await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    await expect(disabledLink).toHaveAttribute('aria-label', 'Primary action, disabled');
    await expect(disabledLink).not.toHaveAttribute('tabindex');
    await expect(disabledLink.tabIndex).toBe(0);
    await expect(loadingLink).toHaveAttribute('aria-busy', 'true');
    await expect(loadingLink).toHaveAttribute('aria-disabled', 'true');
    await expect(loadingLinks).toHaveLength(2);
    await expect(loadingLink).toHaveAttribute('aria-label', 'Loading');
    await expect(loadingLink).not.toHaveAttribute('tabindex');
    await expect(loadingLink.tabIndex).toBe(0);
    await expect(selectedLink).toHaveAttribute('aria-current', 'page');
    await expect(getComputedStyle(loadingLink, '::before').animationName).not.toBe('none');
    await expect(getComputedStyle(loadingLink, '::after').opacity).toBe('0');
    await expect(getComputedStyle(loadingLink).color).toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(disabledLink, '::before').display).toBe('none');
    await expect(loadingLink.childElementCount).toBe(0);

    const sources = within(canvas.getByRole('region', { name: 'Link sources' }));
    await expect(sources.getByRole('link', { name: 'Go to Home' })).toHaveAttribute('href', '/en');
    await expect(sources.getByRole('link', { name: 'Heart health' })).toHaveAttribute(
      'href',
      '/heart-health'
    );
  },
};

export const Documentation: StoryObj = {
  render: () => <ButtonDocumentation />,
};

type PlaygroundArgs = ButtonProps & {
  linkSource: 'linkField' | 'link';
};

export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    variant: 'primary',
    linkSource: 'linkField',
    link: { url: '/heart-health', title: 'Heart health', target: '_self' },
    linkField: SITECORE_LINK_FIELD,
    icon: ICON,
    styles: '',
    disabled: false,
    isLoading: false,
    isCurrent: false,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: VARIANTS,
      description: 'Sets the visual variant and its corresponding *-button hook class.',
      table: { category: 'Button props' },
    },
    linkSource: {
      name: 'Link source',
      control: 'inline-radio',
      options: ['linkField', 'link'],
      description: 'Chooses one supported source. A valid linkField takes priority in production.',
      table: { category: 'Story controls' },
    },
    link: {
      control: 'object',
      description: 'Plain URL, visible title, and optional target.',
      if: { arg: 'linkSource', eq: 'link' },
      table: { category: 'Button props' },
    },
    linkField: {
      control: 'object',
      description: 'Sitecore General Link field. value.text is the visible accessible label.',
      if: { arg: 'linkSource', eq: 'linkField' },
      table: { category: 'Button props' },
    },
    icon: {
      control: {
        type: 'select',
        labels: {
          '': 'None',
          ...Object.fromEntries(
            iconDefinitions.map((icon) => [icon.id, getIconHierarchyLabel(icon)])
          ),
        },
      },
      options: ['', ...sortIconIdsByHierarchy(iconDefinitions)],
      description:
        'Registered icon name derived from the Sitecore item URL after /icons/ and drawn by the ::after of the anchor.',
      table: { category: 'Button props' },
    },
    styles: {
      control: 'inline-radio',
      options: ['button-icon-left', 'button-icon-right'],
      description:
        'Required Sitecore style string; the absence of button-icon-right keeps the icon on the left.',
      table: { category: 'Button props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Uses aria-disabled and prevents navigation while keeping the authored URL.',
      table: { category: 'Button props' },
    },
    isLoading: {
      control: 'boolean',
      description:
        'Uses aria-busy, a centered decorative loading spinner, and prevents navigation.',
      table: { category: 'Button props' },
    },
    isCurrent: {
      control: 'boolean',
      description: 'Uses aria-current="page" for the selected secondary treatment.',
      table: { category: 'Button props' },
    },
  },
  render: ({ linkSource, ...args }) => (
    <Button
      {...args}
      icon={args.icon || undefined}
      link={linkSource === 'link' ? args.link : undefined}
      linkField={linkSource === 'linkField' ? args.linkField : undefined}
    />
  ),
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link');

    await expect(links).toHaveLength(1);
    await expect(links[0].className).toContain('primary-button');
    await expect(links[0]).toHaveAttribute('data-icon-name', ICON);
    await expect(links[0].childElementCount).toBe(0);
    await expect(links[0]).toHaveAccessibleName('Go to Home');
    await expect(links[0]).toHaveAttribute('href', '/en');
  },
};
