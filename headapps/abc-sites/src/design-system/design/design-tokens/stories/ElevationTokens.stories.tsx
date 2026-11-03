import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ElevationTokens } from '../ElevationTokens';

const meta = {
  title: 'Design/Elevation',
  component: ElevationTokens,
  // Single story, or a gallery with its own layout. A Docs entry would only restate it.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component: 'Composed shadow presets and the focus rings built from the same Figma effects.',
      },
    },
  },
} satisfies Meta<typeof ElevationTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shadows: Story = {};
