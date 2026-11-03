import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SpacingTokens } from '../SpacingTokens';

const meta = {
  title: 'Design/Spacing',
  component: SpacingTokens,
  // Single story, or a gallery with its own layout. A Docs entry would only restate it.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'The responsive gap and inset scales. The bars render the live custom property, so they resize with the viewport toolbar.',
      },
    },
  },
} satisfies Meta<typeof SpacingTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scales: Story = {};
