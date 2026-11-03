import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RadiusTokens } from '../RadiusTokens';

const meta = {
  title: 'Design/Radius',
  component: RadiusTokens,
  // Single story, or a gallery with its own layout. A Docs entry would only restate it.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'The named corner-radius roles components should use, and the value behind each.',
      },
    },
  },
} satisfies Meta<typeof RadiusTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Roles: Story = {};
