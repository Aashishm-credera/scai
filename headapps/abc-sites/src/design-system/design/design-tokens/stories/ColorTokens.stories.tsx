import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ColorTokens } from '../ColorTokens';

/**
 * One story per layer: what reds exist, and what to write in a className.
 *
 * Single story, or a gallery with its own layout. A Docs entry would only restate it, and for
 * `layer` specifically would show a broken control: Storybook's TS docgen cannot resolve this
 * destructured prop's type, so the auto-generated table showed an editable "unknown [number]"
 * field for what is really a two-value string union. `controls: disable` below hides it from
 * the story's Controls panel too, since it is not meant to be edited interactively.
 */
const meta = {
  title: 'Design/Colors',
  component: ColorTokens,
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Primitive ramps and semantic roles, read live from the generated tokens. No color value is written by hand in this story.',
      },
    },
  },
} satisfies Meta<typeof ColorTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The raw scales. Documented so the ramp is visible, not so components consume it. */
export const Primitives: Story = { args: { layer: 'primitives' } };

/** The layer components actually use. */
export const Semantic: Story = { args: { layer: 'semantic' } };
