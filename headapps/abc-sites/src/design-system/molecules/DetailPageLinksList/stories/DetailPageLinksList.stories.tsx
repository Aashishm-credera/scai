import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DetailPageLinksList } from '../DetailPageLinksList';
import type { DetailPageLinkItem } from '../detail-page-links-list.props';

const previewImage = {
  value: { src: '/story-assets/image.jpg', width: '60', height: '48', alt: '' },
};

const cards: DetailPageLinkItem[] = [
  {
    id: 'prevention',
    link: { value: { href: '#prevention' } },
    title: { value: 'Heart health and prevention' },
    description: { value: 'Learn how everyday choices can help protect your heart.' },
    image: previewImage,
  },
  {
    id: 'signs',
    link: { value: { href: '#signs' } },
    title: { value: 'Recognize the warning signs' },
    description: { value: 'Find out when to act and how to get help.' },
    image: previewImage,
  },
  {
    id: 'recovery',
    link: { value: { href: '#recovery' } },
    title: { value: 'Living well after treatment' },
    description: { value: 'Explore practical support for your recovery.' },
    image: previewImage,
  },
];

const meta = {
  title: 'Molecules/Detail Page Links List',
  component: DetailPageLinksList,
  args: { heading: { value: 'Related guides' }, cards },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'API-driven vertical navigation cards. H3 section title and H4 card titles. Content wraps and grows; place inside the page content container.',
      },
    },
  },
} satisfies Meta<typeof DetailPageLinksList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 3, name: 'Related guides' })).toBeVisible();
    await expect(canvas.getAllByRole('heading', { level: 4 })).toHaveLength(3);
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
    for (const link of canvas.getAllByRole('link')) {
      const title = link.querySelector('h4')!;
      const image = link.querySelector('img')!;
      await expect(image).toBeVisible();
      await expect(image.getBoundingClientRect().right).toBeLessThanOrEqual(
        title.getBoundingClientRect().left
      );
    }
  },
};

export const OneCard: Story = { args: { cards: cards.slice(0, 1) } };
export const NoSectionTitle: Story = { args: { heading: undefined } };
export const RichTextHeading: Story = {
  args: { heading: { value: 'Learn more about high blood pressure®' } },
};
export const OptionalDescription: Story = {
  args: { cards: [{ ...cards[0], description: undefined }] },
};
export const WithoutImages: Story = {
  args: { cards: cards.map((item) => ({ ...item, image: undefined })) },
};
export const LongContent: Story = {
  args: {
    cards: [
      {
        ...cards[0],
        title: {
          value:
            'Understanding cardiovascular health, available treatment options, and support for your family throughout recovery',
        },
        description: {
          value:
            'Find clear information about heart health, prevention, treatment and recovery, including the questions you can discuss with your care team. '.repeat(
              4
            ),
        },
      },
    ],
  },
};
export const LongUnbrokenText: Story = {
  args: {
    cards: [
      {
        ...cards[0],
        title: { value: 'CardiovascularHealth'.repeat(20) },
        description: { value: `https://example.test/${'long-path-without-spaces'.repeat(30)}` },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    for (const element of canvasElement.querySelectorAll('h4, a')) {
      await expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth + 1);
    }
  },
};
export const MissingDatasource: Story = { args: { cards: [], heading: undefined } };
export const MissingLink: Story = {
  args: { cards: [{ ...cards[0], link: undefined }] },
};
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getAllByRole('link')[0]);
  },
};
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getAllByRole('link')[0];
    await userEvent.click(canvasElement);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.matches(':focus-visible')).toBe(true);
    const focusRing = getComputedStyle(link, '::after');
    await expect(focusRing.boxShadow).toBe('rgb(207, 34, 43) 0px 0px 0px 2px inset');
    await expect(focusRing.top).toBe('0px');
    await expect(focusRing.borderRadius).toBe(getComputedStyle(link).borderRadius);
    await userEvent.tab();
    await expect(link).not.toHaveFocus();
    await expect(getComputedStyle(link, '::after').boxShadow).toBe('none');
  },
};
export const Pressed: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getAllByRole('link')[0];
    await userEvent.pointer({ keys: '[MouseLeft>]', target: link });
    await expect(link).toBeVisible();
    await userEvent.pointer({ keys: '[/MouseLeft]', target: canvasElement });
  },
};
export const Mobile: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: 'md', isRotated: false } } };
export const Desktop: Story = { globals: { viewport: { value: 'lg', isRotated: false } } };
export const LargeDesktop: Story = { globals: { viewport: { value: 'xl', isRotated: false } } };
