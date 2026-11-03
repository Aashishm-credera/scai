import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { InPageSidebarNavigation } from '../InPageSidebarNavigation';
import { InPageSidebarNavigationLayout } from '../InPageSidebarNavigationLayout';

const items = [
  { id: 'overview', label: 'Overview', subText: 'Understand the basics' },
  { id: 'warning-signs', label: 'Warning Signs', subText: 'Know when to get help' },
  { id: 'causes-risks', label: 'Causes & Risks', subText: 'Learn what affects your heart' },
  { id: 'diagnosis', label: 'Diagnosis', subText: 'Preparing for your appointment' },
  { id: 'treatment', label: 'Treatment', subText: 'Explore your care options' },
  { id: 'living-well', label: 'Living Well', subText: 'Build healthy everyday habits' },
];

const meta = {
  title: 'Organisms/In Page Sidebar Navigation',
  component: InPageSidebarNavigation,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/DYhenSpnamlWoqLmszNKE3/?node-id=19700-10897',
    },
  },
  decorators: [
    (Story, context) => (
      <div
        className={context.parameters.fullWidth ? 'mx-auto w-full max-w-352' : 'w-full max-w-84'}
      >
        <Story />
      </div>
    ),
  ],
  args: { title: 'In this guide', titleId: 'in-this-guide', items },
} satisfies Meta<typeof InPageSidebarNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'In this guide' })).toBeVisible();
    if (window.innerWidth < 1024) {
      await userEvent.click(canvas.getByRole('button'));
    }
    await expect(canvas.getAllByRole('link')).toHaveLength(items.length);
    await expect(canvas.getByRole('link', { name: /Overview/ })).toHaveAttribute(
      'href',
      '#overview'
    );
  },
};
export const SelectedSection: Story = { args: { activeItemId: 'overview' } };
export const WithoutDescriptions: Story = {
  args: { items: items.map((item) => ({ ...item, subText: undefined })) },
};
export const WithoutTitle: Story = { args: { title: undefined, 'aria-label': 'Guide sections' } };
export const RichLabel: Story = {
  args: {
    items: [
      {
        id: 'rich-label',
        label: (
          <>
            Heart health<sup>®</sup>
          </>
        ),
      },
    ],
  },
};
export const LongContent: Story = {
  args: {
    items: [
      {
        id: 'long-content',
        label: 'Understanding cardiovascular health and the available treatment options',
        subText: 'CardiovascularHealth'.repeat(12),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation');
    await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth);
  },
};
export const Empty: Story = { args: { items: [] } };
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement);
    await userEvent.tab();
    const canvas = within(canvasElement);
    await expect(
      window.innerWidth < 1024 ? canvas.getByRole('button') : canvas.getAllByRole('link')[0]
    ).toHaveFocus();
  },
};
export const Mobile: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: 'md', isRotated: false } } };
export const Desktop: Story = { globals: { viewport: { value: 'lg', isRotated: false } } };
export const LargeDesktop: Story = { globals: { viewport: { value: 'xl', isRotated: false } } };

export const PageBuilder: Story = { args: { isEditing: true } };

export const ResponsiveLayout: Story = {
  parameters: { fullWidth: true },
  render: (args) => (
    <InPageSidebarNavigationLayout navigation={<InPageSidebarNavigation {...args} />}>
      {items.map((item) => (
        <section key={item.id} id={item.id} className="min-h-96 scroll-mt-6 py-6">
          <h2 className="mb-6 text-heading-md">{item.label}</h2>
          <p className="text-body-md">{item.subText}</p>
        </section>
      ))}
    </InPageSidebarNavigationLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation');
    const isMobile = window.innerWidth < 1024;

    await expect(getComputedStyle(nav).position).toBe(isMobile ? 'fixed' : 'sticky');
    if (isMobile) {
      const toggle = canvas.getByRole('button');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await userEvent.click(toggle);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const sectionLink = canvas.getByRole('link', { name: /Warning Signs/ });
      await expect(sectionLink).toHaveAttribute('href', '#warning-signs');
      // Keep Vitest's browser runner URL intact while exercising selection.
      sectionLink.addEventListener('click', (event) => event.preventDefault(), { once: true });
      await userEvent.click(sectionLink);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toHaveTextContent('Warning Signs');
    } else {
      const content = canvas.getByRole('heading', { name: 'Overview' }).parentElement!
        .parentElement!;
      const gap = content.getBoundingClientRect().left - nav.getBoundingClientRect().right;
      await expect(gap).toBeGreaterThanOrEqual(24);
      await expect(gap).toBeLessThanOrEqual(151);
    }

    window.scrollTo(0, 500);
    await waitFor(() => {
      const bounds = nav.getBoundingClientRect();
      if (isMobile) {
        expect(Math.round(window.innerHeight - bounds.bottom)).toBe(16);
      } else {
        expect(Math.round(bounds.top)).toBe(24);
      }
    });
    window.scrollTo(0, 0);
  },
};

export const MobileBottomNavigation: Story = {
  ...ResponsiveLayout,
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

export const MobileOpen: Story = {
  globals: { viewport: { value: 'mobile', isRotated: false } },
  args: { activeItemId: 'overview' },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/DYhenSpnamlWoqLmszNKE3/?node-id=19700-10940',
    },
  },
  play: async ({ canvasElement }) => {
    if (window.innerWidth >= 1024) return;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    const close = canvas.getByRole('button', { name: 'Close' });
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(items.length);
    await expect(links[0]).toHaveFocus();
    await expect(close).toBeVisible();
    await expect(close.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      canvas.getByRole('list').getBoundingClientRect().bottom
    );
    await expect(close.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight - 16);
  },
};

export const MobileCloseButton: Story = {
  ...MobileOpen,
  play: async ({ canvasElement }) => {
    if (window.innerWidth >= 1024) return;
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button');
    await userEvent.click(toggle);
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveFocus();
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);

    await userEvent.click(toggle);
    await userEvent.keyboard('{Escape}');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveFocus();
  },
};
