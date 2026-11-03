import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DescriptionText } from '@/design-system/atoms/DescriptionText';
import { HeadingText } from '@/design-system/atoms/HeadingText';
import { ContentSection } from '../ContentSection';

const meta = {
  title: 'Organisms/Content Section',
  component: ContentSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Responsive section with optional heading, number, description, and child content. Adjacent sections have dividers; the final divider is hidden. The rendering supplies the heading and description elements.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full min-w-0 max-w-231">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    heading: { control: false },
    headingNumber: { control: { type: 'number', min: 1, step: 1 } },
    description: { control: false },
    children: { control: false },
  },
  args: {
    'aria-labelledby': 'content-section-heading',
    heading: (
      <HeadingText
        id="content-section-heading"
        isEditing={false}
        HeadingField={{ value: 'Overview' }}
      />
    ),
    description: (
      <DescriptionText
        size="l"
        DescriptionField={{
          value: '<p>Learn about your heart health and the steps you can take to care for it.</p>',
        }}
      />
    ),
    children: (
      <DescriptionText
        DescriptionField={{
          value:
            '<p>Small changes to your daily routine can support your heart health.</p><ul><li>Stay active throughout the week.</li><li>Choose a variety of nutritious foods.</li><li>Talk with your care team about your goals.</li></ul>',
        }}
      />
    ),
  },
} satisfies Meta<typeof ContentSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Numbered: Story = { args: { headingNumber: 1 } };

export const HeadingOnly: Story = {
  args: { description: undefined, children: undefined },
};

export const DescriptionOnly: Story = {
  args: {
    heading: undefined,
    children: undefined,
    'aria-labelledby': undefined,
    'aria-label': 'Introduction',
  },
};

export const ContentOnly: Story = {
  args: {
    heading: undefined,
    description: undefined,
    'aria-labelledby': undefined,
    'aria-label': 'Heart health tips',
  },
};

export const StackedSections: Story = {
  render: (args) => (
    <>
      <ContentSection {...args} headingNumber={1} />
      <ContentSection
        {...args}
        headingNumber={2}
        aria-labelledby="warning-signs-heading"
        heading={
          <HeadingText
            id="warning-signs-heading"
            isEditing={false}
            HeadingField={{ value: 'Warning signs' }}
          />
        }
        description={
          <DescriptionText
            size="l"
            DescriptionField={{
              value: '<p>Understand the symptoms to discuss with your care team.</p>',
            }}
          />
        }
      />
    </>
  ),
};

export const Mobile: Story = {
  args: { headingNumber: 1 },
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

export const LongHeading: Story = {
  args: {
    headingNumber: 12,
    heading: (
      <HeadingText
        id="content-section-heading"
        isEditing={false}
        HeadingField={{ value: 'Understanding your cardiovascular health and treatment options' }}
      />
    ),
  },
};
