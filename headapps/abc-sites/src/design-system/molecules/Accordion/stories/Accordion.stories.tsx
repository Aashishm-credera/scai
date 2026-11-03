import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Accordion, type AccordionItemData } from '@/design-system/molecules/Accordion';

const answer = {
  value:
    '<p>Lorem ipsum dolor sit amet consectetur. Natoque habitant diam placerat orci aliquam cursus mauris bibendum phasellus. Dolor <a href="/heart-health">vestibulum</a> volutpat molestie eget. Ullamcorper tortor enim leo nulla dignissim pellentesque nisl. Volutpat imperdiet ornare ac massa mauris bibendum elementum.</p>',
};

const items: AccordionItemData[] = [
  'Is there a free trial available?',
  'Can I change my plan later?',
  'What is your cancellation policy?',
  'Can other info be added to an invoice?',
  'How does billing work?',
  'How do I change my account email?',
].map((question, index) => ({
  anchor: `faq-${index + 1}`,
  question: { value: question },
  answer,
}));

const meta = {
  title: 'Molecules/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: {
    title: { value: 'Title goes here' },
    items,
    isEditing: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Questions that reveal their answers one at a time. Opening an item closes the open one. Link to `#<anchor>` to open an item and scroll it to the top of the viewport.',
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutTitle: Story = {
  args: { title: undefined },
};

export const LongText: Story = {
  args: {
    items: [
      {
        anchor: 'long-question',
        question: {
          value:
            'Can a question that runs well past the width of the accordion wrap onto a second and third line without ever being truncated?',
        },
        answer: {
          value: `<p>${'Supercalifragilisticexpialidocious '.repeat(12)}</p><ul><li>First point</li><li>Second point</li></ul>`,
        },
      },
      ...items.slice(1, 3),
    ],
  },
};

export const Editing: Story = {
  args: { isEditing: true },
};
