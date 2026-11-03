import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DemoBlock } from '#mocks/DemoBlock';
import { GridCanvas } from '#mocks/GridCanvas';
import { BaseColumn, type ColumnSpan } from '@/design-system/atoms/BaseColumn';
import { BaseRow } from '@/design-system/atoms/BaseRow';

/**
 * Row is the grid track: 6 columns on mobile, 12 from 480px up, with the Figma gutter. The widths
 * come from the Columns inside it. Each story sits in a Container with the grid drawn behind it:
 * every column edge should land on a red bar's edge, and every gap on a gutter.
 *
 * Components use Row and Column for layouts with columns inside themselves. Authors do not place
 * them directly.
 */
const columns = (...spans: ColumnSpan[]) =>
  spans.map((span, index) => (
    <BaseColumn key={index} span={span}>
      <DemoBlock>span {span}</DemoBlock>
    </BaseColumn>
  ));

const meta = {
  title: 'Atoms/Row',
  component: BaseRow,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <GridCanvas>
        <Story />
      </GridCanvas>
    ),
  ],
} satisfies Meta<typeof BaseRow>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Two equal halves. Below `md` every column collapses to full width, that stacking is the
 * behaviour to check in the viewport toolbar, since it is what mobile actually gets.
 */
export const TwoColumns: Story = {
  args: { children: columns(6, 6) },
};

/** Thirds, the most common editorial layout. */
export const ThreeColumns: Story = {
  args: { children: columns(4, 4, 4) },
};

/** Asymmetric main + sidebar, the case most likely to expose an off-by-one in the span map. */
export const SidebarLayout: Story = {
  args: { children: columns(8, 4) },
};

/** Twelve single-column cells: the clearest way to eyeball the gutter and the track count. */
export const TwelveSingleColumns: Story = {
  args: { children: columns(...Array<ColumnSpan>(12).fill(1)) },
};

/** Nothing placed yet. The grid should take no vertical space. */
export const Empty: Story = {};
