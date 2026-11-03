import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DemoBlock } from '#mocks/DemoBlock';
import { GridCanvas } from '#mocks/GridCanvas';
import { BaseRow } from '@/design-system/atoms/BaseRow';
import { BaseColumn, COLUMN_SPANS } from '@/design-system/atoms/BaseColumn';

/**
 * A Column only means something inside a Row's grid, so the decorator below supplies one, inside
 * a Container with the grid drawn behind it. Use the `span` control to try widths: the column
 * should cover exactly that many red bars. Below 480px every span is full width.
 *
 * Components use Row and Column for layouts with columns inside themselves. Authors do not place
 * them directly.
 */
const meta = {
  title: 'Atoms/Column',
  component: BaseColumn,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <GridCanvas>
        <BaseRow>
          <Story />
        </BaseRow>
      </GridCanvas>
    ),
  ],
  args: { span: 6, children: <DemoBlock>Column content</DemoBlock> },
  argTypes: {
    span: { control: 'select', options: COLUMN_SPANS },
  },
} satisfies Meta<typeof BaseColumn>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HalfWidth: Story = {};

export const ThirdWidth: Story = {
  args: { span: 4 },
};

export const FullWidth: Story = {
  args: { span: 12 },
};

/**
 * No span. The column falls back to the grid's natural single-track placement instead of
 * breaking the layout. This is what an author gets for a width we do not support.
 */
export const NoSpan: Story = {
  args: { span: undefined },
};
