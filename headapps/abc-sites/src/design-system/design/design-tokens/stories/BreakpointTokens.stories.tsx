import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BreakpointTokens } from '../BreakpointTokens';

const meta = {
  title: 'Design/Breakpoints',
  component: BreakpointTokens,
  // Single story, or a gallery with its own layout. A Docs entry would only restate it.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'The centralized thresholds shared by the runtime token module, the generated media queries, and Tailwind’s responsive prefixes.',
      },
    },
  },
} satisfies Meta<typeof BreakpointTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Thresholds: Story = {};
