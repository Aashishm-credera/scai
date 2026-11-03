import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DescriptionText } from '..';

const copy = `<p>Small, everyday changes can support your <a href="#heart-health">heart health</a>. Talk with your healthcare team about what works for you.</p>
<ul><li>Choose a variety of nutritious foods.</li><li>Find ways to move that you enjoy, including activities that can fit comfortably into your daily routine.</li></ul>
<ol><li>Learn about your risk factors.</li><li>Set a goal with your healthcare team.</li><li>Track your progress and <a href="https://www.heart.org">explore more resources</a>.</li></ol>`;

const meta = {
  title: 'Atoms/Description Text',
  component: DescriptionText,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Backend rich text with native paragraphs, lists, and keyboard-operable links. Typography and spacing use responsive semantic tokens. Figma node-specific styling and maximum widths are pending Inspect values; this preview is provisional.',
      },
    },
  },
  args: { DescriptionField: { value: copy }, isEditing: false, size: 'm' },
  argTypes: {
    DescriptionField: { control: 'object' },
    size: { control: 'select', options: ['l', 'm', 's'] },
    isEditing: { control: 'boolean' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof DescriptionText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const internal = canvas.getByRole('link', { name: 'heart health' });
    const external = canvas.getByRole('link', { name: 'explore more resources' });
    await expect(canvas.getAllByRole('list')).toHaveLength(2);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5);
    await expect(internal).not.toHaveAttribute('aria-label');
    await expect(external).toHaveAttribute('href', 'https://www.heart.org');
    internal.focus();
    await expect(internal).toHaveFocus();
    let activated = false;
    internal.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        activated = true;
      },
      { once: true }
    );
    await userEvent.keyboard('{Enter}');
    await expect(activated).toBe(true);
    await userEvent.tab();
    await expect(external).toHaveFocus();
  },
};

export const Small: Story = {
  args: { size: 's' },
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

export const Medium: Story = {
  args: { size: 'm' },
  globals: { viewport: { value: 'md', isRotated: false } },
};

export const Large: Story = {
  args: { size: 'l' },
  globals: { viewport: { value: 'lg', isRotated: false } },
};

export const OrderedListBadges: Story = {
  args: {
    DescriptionField: {
      value: `<ol>${Array.from(
        { length: 12 },
        (_, index) =>
          `<li>Step ${index + 1}: ${'Longer description copy wraps alongside its number badge. '.repeat(3)}</li>`
      ).join(
        ''
      )}</ol><ol start="9"><li>Authored starting number</li><li>Next number<ol><li>Nested first step</li><li>Nested second step</li></ol></li></ol>`,
    },
  },
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lists = canvas.getAllByRole('list');
    await expect(lists).toHaveLength(3);
    await expect(lists[1]).toHaveAttribute('start', '9');
    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(16);
    for (const item of items) {
      const badge = getComputedStyle(item, '::before');
      await expect(badge.content).toContain('counter(list-item)');
      await expect(badge.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      await expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth);
    }
  },
};

export const LongContent: Story = {
  args: {
    DescriptionField: {
      value: `<p>${'Description copy wraps without truncation. '.repeat(40)}<a href="#long-link">${'LongLinkText'.repeat(30)}</a></p>`,
    },
  },
};

export const Empty: Story = { args: { DescriptionField: { value: '<p><br /></p>' } } };
