import type { ArgTypes } from '@storybook/react';
import { LinkDropdown, type LinkDropdownItem } from '@/design-system/molecules/LinkDropdown';

export type LinkDropdownPlaygroundProps = {
  defaultOpen: boolean;
  itemCount: 1 | 2 | 3;
  longLabel: boolean;
  navigationLabel: string;
  triggerLabel: string;
};

export const linkDropdownPlaygroundArgTypes = {
  defaultOpen: {
    control: 'boolean',
    description: 'Whether the popup is open on its first render.',
    table: { category: 'LinkDropdown props' },
  },
  triggerLabel: {
    name: 'Trigger label',
    control: 'text',
    description: 'Accessible name for the ellipsis button.',
    table: { category: 'LinkDropdown props' },
  },
  navigationLabel: {
    name: 'Navigation label',
    control: 'text',
    description: 'Accessible name for the popup navigation landmark.',
    table: { category: 'LinkDropdown props' },
  },
  itemCount: {
    name: 'Hidden pages',
    control: 'inline-radio',
    options: [1, 2, 3],
    description: 'Number of generated hidden breadcrumb links.',
    table: { category: 'Story controls' },
  },
  longLabel: {
    name: 'Long first label',
    control: 'boolean',
    description: 'Tests intrinsic width and viewport overflow.',
    table: { category: 'Story controls' },
  },
} satisfies ArgTypes<LinkDropdownPlaygroundProps>;

type BreadcrumbLink = {
  url: string;
  pageName: string;
};

const hiddenBreadcrumbs = [
  { url: '/en/healthy-living', pageName: 'Healthy Living' },
  { url: '/en/healthy-living/healthy-eating', pageName: 'Healthy Eating' },
  { url: '/en/healthy-living/healthy-eating/nutrition', pageName: 'Nutrition Basics' },
] satisfies readonly BreadcrumbLink[];

const longItemLabel =
  'A comprehensive guide to preventing cardiovascular disease throughout every stage of life';

export function LinkDropdownPlayground(props: LinkDropdownPlaygroundProps) {
  const hiddenBreadcrumbLinks = hiddenBreadcrumbs.slice(0, props.itemCount).map((item, index) => ({
    ...item,
    pageName: index === 0 && props.longLabel ? longItemLabel : item.pageName,
  }));
  const items = hiddenBreadcrumbLinks.map(({ url, pageName }) => ({
    id: url,
    href: url,
    label: pageName,
  })) satisfies readonly LinkDropdownItem[];
  const usage = `type BreadcrumbLink = {
  url: string;
  pageName: string;
};

const hiddenBreadcrumbLinks: readonly BreadcrumbLink[] = [
${hiddenBreadcrumbLinks.map((item) => `  { url: '${item.url}', pageName: '${item.pageName}' },`).join('\n')}
];

<LinkDropdown
  triggerLabel="${props.triggerLabel}"
  navigationLabel="${props.navigationLabel}"
  defaultOpen={${props.defaultOpen}}
  items={hiddenBreadcrumbLinks.map(({ url, pageName }) => ({
    id: url,
    href: url,
    label: pageName,
  }))}
/>`;

  return (
    <main className="mx-auto grid max-w-3xl gap-(--abc-spacing-gap-xl) bg-(--abc-surface-default-primary) p-(--abc-spacing-inset-xl) text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-xs)">
        <h1 className="text-heading-sm font-semibold">Link dropdown playground</h1>
        <p className="text-body-sm text-(--abc-text-default-tertiary)">
          Adjust the initial state, number of hidden pages, long-label behavior, and accessible
          names.
        </p>
      </header>

      <pre
        tabIndex={0}
        className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-tertiary) p-(--abc-spacing-inset-lg) text-body-sm focus-visible:shadow-[0_0_0_var(--abc-space-4)_var(--abc-surface-default-primary)] focus-visible:outline-2 focus-visible:outline-offset-(--abc-space-4) focus-visible:outline-(--abc-border-focus)"
      >
        <code>{usage}</code>
      </pre>

      <section
        aria-label="Link dropdown preview"
        className="grid min-h-80 place-items-center rounded-(--abc-radius-lg) border border-(--abc-border-default-primary) p-(--abc-spacing-inset-4xl)"
        onClickCapture={(event) => {
          if ((event.target as Element).closest('a')) event.preventDefault();
        }}
      >
        <LinkDropdown
          key={props.defaultOpen ? 'open' : 'closed'}
          defaultOpen={props.defaultOpen}
          items={items}
          navigationLabel={props.navigationLabel}
          triggerLabel={props.triggerLabel}
        />
      </section>
    </main>
  );
}
