import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { BaseBreadcrumb } from '../BaseBreadcrumb';

const CURRENT_LABEL = 'Understanding heart failure and available treatment options';

const meta = {
  title: 'Atoms/Breadcrumb',
  component: BaseBreadcrumb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Shows ancestors from Home through Parent, excluding the current page. Long trails collapse into a navigation dropdown, while labels truncate only when the available width requires it.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BaseBreadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    breadcrumbItems: [
      { title: 'Home', url: '/home' },
      { title: 'Health topics', url: '/health-topics' },
      { title: 'Heart health', url: '/health-topics/heart-health' },
      { title: 'Prevention', url: '/health-topics/heart-health/prevention' },
    ],
  },
};

export const Short: Story = {
  args: {
    breadcrumbItems: [
      { title: 'Home', url: '/home' },
      { title: 'Health topics', url: '/health-topics' },
    ],
  },
};

export const Deep: Story = {
  args: {
    breadcrumbItems: [
      { title: 'Home', url: '/home' },
      { title: 'Health topics', url: '/health-topics' },
      { title: 'Conditions', url: '/health-topics/conditions' },
      { title: 'Heart failure', url: '/health-topics/conditions/heart-failure' },
      { title: 'Treatment', url: '/health-topics/conditions/heart-failure/treatment' },
      { title: 'Prevention', url: '/prevention' },
    ],
  },
};

export const Mobile: Story = {
  ...Default,
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const breadcrumb = within(canvasElement).getByRole('navigation', { name: 'Breadcrumb' });
    const visibleLinks = within(breadcrumb).getAllByRole('link');

    await expect(visibleLinks.map((link) => link.textContent)).toEqual(['Home', 'Prevention']);
    await expect(within(breadcrumb).getByRole('button')).toHaveAccessibleName(
      'Show hidden breadcrumb pages'
    );
    await expect(visibleLinks[1]).not.toHaveAttribute('aria-current');
  },
};

export const TruncatedLabels: Story = {
  args: {
    breadcrumbItems: [
      { title: 'Home', url: '/home' },
      {
        title: 'Conditions and treatments for cardiovascular disease',
        url: '/health-topics/conditions',
      },
      { title: 'Heart failure', url: '/health-topics/conditions/heart-failure' },
      { title: CURRENT_LABEL, url: '/health-topics/conditions/heart-failure/treatment' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-105 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const currentPage = within(canvasElement).getByRole('link', { name: CURRENT_LABEL });
    await expect(currentPage).toHaveAccessibleName(CURRENT_LABEL);

    await userEvent.hover(currentPage);
    const tooltip = await within(canvasElement.ownerDocument.body).findByText(CURRENT_LABEL, {
      selector: 'p',
    });
    await waitFor(() => expect(tooltip).toBeVisible());
  },
};

export const Empty: Story = {
  args: {
    breadcrumbItems: [],
  },
};

export const LongBreadcrumbTrails: Story = {
  ...Deep,
  play: async ({ canvasElement }) => {
    const breadcrumb = within(canvasElement).getByRole('navigation', { name: 'Breadcrumb' });
    const links = within(breadcrumb).getAllByRole('link');
    await expect(links.map((link) => link.textContent)).toEqual([
      'Home',
      'Health topics',
      'Prevention',
    ]);
    await expect(links.every((link) => !link.hasAttribute('aria-current'))).toBe(true);
    const trigger = within(breadcrumb).getByRole('button');
    const label = trigger.querySelector('.link-dropdown-trigger-label')!;
    const view = canvasElement.ownerDocument.defaultView!;
    await expect(view.getComputedStyle(label).color).toBe('rgb(91, 90, 87)');
    await userEvent.click(trigger);
    await waitFor(() => expect(view.getComputedStyle(label).color).toBe('rgb(91, 90, 87)'));
    const hidden = await within(canvasElement.ownerDocument.body).findByRole('navigation', {
      name: 'Hidden breadcrumb pages',
    });
    await expect(
      within(hidden)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Conditions', 'Heart failure', 'Treatment']);
    within(hidden).getAllByRole('link')[0].focus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(hidden).not.toBeInTheDocument());
  },
};

export const ShortTrails: Story = {
  ...Short,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Home',
      'Health topics',
    ]);
    await expect(canvas.queryByRole('button')).toBeNull();
    const home = canvas.getByRole('link', { name: 'Home' });
    const view = canvasElement.ownerDocument.defaultView!;
    await expect(view.getComputedStyle(home).fontWeight).toBe('500');
    await expect(view.getComputedStyle(home).fontSize).toBe('14px');
    await expect(view.getComputedStyle(home).lineHeight).toBe('21px');
    home.focus();
    await expect(home).toHaveFocus();
    await waitFor(() => expect(view.getComputedStyle(home).color).toBe('rgb(61, 60, 58)'));
    await expect(view.getComputedStyle(home).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    const parent = canvas.getByRole('link', { name: 'Health topics' });
    parent.focus();
    await expect(parent).toHaveFocus();
    await waitFor(() => expect(view.getComputedStyle(parent).color).toBe('rgb(61, 60, 58)'));
  },
};

export const SharedLabelWidth: Story = {
  ...TruncatedLabels,
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    const labels = links.map((link) => link as HTMLElement);
    await waitFor(() => expect(labels[1].scrollWidth).toBeGreaterThan(labels[1].clientWidth));
    await expect(labels[2].scrollWidth).toBeGreaterThan(labels[2].clientWidth);
    await expect(
      Math.abs(links[1].getBoundingClientRect().width - links[2].getBoundingClientRect().width)
    ).toBeLessThan(1);
    await expect(labels[0].scrollWidth).toBe(labels[0].clientWidth);
    links[2].focus();
    const body = within(canvasElement.ownerDocument.body);
    const tooltip = await body.findByText(CURRENT_LABEL, { selector: 'p' });
    await waitFor(() => expect(tooltip).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await expect(links[2]).toHaveFocus();
    await waitFor(() =>
      expect(body.queryByText(CURRENT_LABEL, { selector: 'p' })).not.toBeInTheDocument()
    );
  },
};

export const ShortL2SharedWidth: Story = {
  ...TruncatedLabels,
  args: {
    breadcrumbItems: [
      { title: 'Home', url: '/home' },
      { title: 'Health', url: '/health' },
      { title: 'Conditions', url: '/conditions' },
      { title: CURRENT_LABEL, url: '/parent' },
    ],
  },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    const shortLabel = links[1] as HTMLElement;
    await expect(shortLabel.scrollWidth).toBe(shortLabel.clientWidth);
    await expect(links[2].getBoundingClientRect().width).toBeGreaterThan(
      links[1].getBoundingClientRect().width
    );
  },
};

export const ShortParentSharedWidth: Story = {
  ...ShortL2SharedWidth,
  args: {
    breadcrumbItems: [
      { title: 'Home', url: '/home' },
      { title: CURRENT_LABEL, url: '/health' },
      { title: 'Conditions', url: '/conditions' },
      { title: 'Prevention', url: '/parent' },
    ],
  },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    const shortLabel = links[2] as HTMLElement;
    await expect(shortLabel.scrollWidth).toBe(shortLabel.clientWidth);
    await expect(links[1].getBoundingClientRect().width).toBeGreaterThan(
      links[2].getBoundingClientRect().width
    );
  },
};

export const MobileCollapse: Story = {
  ...Mobile,
  play: async ({ canvasElement }) => {
    const breadcrumb = within(canvasElement).getByRole('navigation', { name: 'Breadcrumb' });
    await expect(
      within(breadcrumb)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Home', 'Prevention']);
    const trigger = within(breadcrumb).getByRole('button');
    await userEvent.click(trigger);
    const hidden = await within(canvasElement.ownerDocument.body).findByRole('navigation', {
      name: 'Hidden breadcrumb pages',
    });
    await expect(
      within(hidden)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Health topics', 'Heart health']);
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(hidden).not.toBeInTheDocument());
  },
};

export const MobileLabelWidth: Story = {
  ...Mobile,
  args: {
    breadcrumbItems: [
      { title: 'Home', url: '/home' },
      { title: 'Health topics', url: '/health' },
      { title: 'Heart health', url: '/heart' },
      { title: 'Managing heart failure', url: '/parent' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 232, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    const home = links[0] as HTMLElement;
    const parent = links[1] as HTMLElement;
    await expect(home.scrollWidth).toBe(home.clientWidth);
    await expect(parent.scrollWidth).toBeGreaterThan(parent.clientWidth);
    const view = canvasElement.ownerDocument.defaultView!;
    await expect(view.getComputedStyle(links[0]).fontSize).toBe('13px');
  },
};

export const MobileLabelEnoughSpace: Story = {
  ...MobileLabelWidth,
  decorators: [
    (Story) => (
      <div style={{ width: 358, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    for (const link of links) {
      const label = link as HTMLElement;
      await expect(label.scrollWidth).toBe(label.clientWidth);
    }
  },
};
