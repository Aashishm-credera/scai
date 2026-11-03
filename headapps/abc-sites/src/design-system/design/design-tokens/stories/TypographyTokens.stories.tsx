import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  TypographyPlayground,
  playgroundElements,
  sizesForRole,
  type TypographyPlaygroundProps,
} from '../TypographyPlayground';
import { TypographyTokens, typographyRoles, type TypographyRole } from '../TypographyTokens';

const sampleText = 'Heart health starts with a strong foundation.';

/** Every step any role defines. The playground validates the pairing at render time. */
const allSizes = [...new Set(typographyRoles.flatMap(sizesForRole))];

/**
 * One story per role rather than one page listing all four. The Docs entry stacks them, so the
 * combined view is still there, but a reader after the body scale can link straight to it
 * instead of scrolling past display, heading and label first.
 */
const meta = {
  title: 'Design/Typography',
  component: TypographyTokens,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The display, heading, body and label scales. Samples use the real utility classes, so switching the viewport toolbar shows the responsive step.',
      },
      // The default autodocs template opens with <Primary />, which repeats the first story,
      // so the page led with `display` at full per-breakpoint detail, then showed it again
      // under STORIES. Swapping that for a compact overview means the top of the page answers
      // "what does the whole scale look like stacked", and the breakpoint tables stay where
      // they are useful: on each role's own story below.
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          {/* <Primary /> renders the first story and is wired to <Controls />, so changing the
              role control swaps which scale is shown here. That first story is `Overview`, which
              runs compact. The per-breakpoint tables belong to the role stories below. */}
          <Primary />
          <Controls />
          {/* Otherwise `Overview` renders twice: once above, once at the head of this list. */}
          <Stories includePrimary={false} />
        </>
      ),
      source: {
        // Without this, "Show code" prints `<TypographyTokens role="display" />`. The
        // documentation component, which nobody should ever write. Replace it with the thing a
        // reader actually came for: the utility classes this page is documenting.
        transform: (_code: string, context: { args: { role?: TypographyRole } }) => {
          const role = context.args.role;
          if (!role) return _code;
          const sizes = sizesForRole(role);
          return [
            `// ${role} sizes: ${sizes.join(', ')}`,
            `<h1 className="text-${role}-${sizes.at(-1)}">${sampleText}</h1>`,
            `<p className="text-${role}-${sizes[0]}">${sampleText}</p>`,
          ].join('\n');
        },
      },
    },
  },
  argTypes: {
    // react-docgen reads the union as `unknown[number]` and renders a free-text box. Declaring
    // the options makes it a select, and makes the Docs controls table readable.
    role: {
      control: { type: 'select' },
      options: typographyRoles,
      description: 'Which scale to document.',
      table: { type: { summary: typographyRoles.join(' | ') } },
    },
    // An implementation detail of the Docs layout, not something a reader should toggle.
    detail: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof TypographyTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Exists only to be the `<Primary />` block at the top of the Docs page. It must stay the first
 * export for that. `!dev` keeps it out of the sidebar, where it would be a third way of saying
 * what Docs and Playground already say.
 */
export const Overview: Story = {
  tags: ['!dev'],
  args: { role: 'display', detail: false },
  parameters: {
    docs: {
      description: {
        story:
          'Pick a role in the controls to swap which scale is shown. Every step renders at its real size; the per-breakpoint values live on the role stories below.',
      },
    },
  },
};

export const Display: Story = { args: { role: 'display' } };

export const Heading: Story = { args: { role: 'heading' } };

export const Body: Story = { args: { role: 'body' } };

export const Label: Story = { args: { role: 'label' } };

/**
 * The interactive one. Everything above is a reference table; this is where you try a class
 * against your own copy before committing to it.
 */
export const Playground: StoryObj<TypographyPlaygroundProps> = {
  render: (args) => <TypographyPlayground {...args} />,
  args: {
    role: 'display',
    size: '2xl',
    text: sampleText,
    element: 'h1',
  },
  argTypes: {
    role: { control: { type: 'select' }, options: typographyRoles },
    size: {
      control: { type: 'select' },
      options: allSizes,
      description: 'Not every role defines every step. The preview says so when it does not.',
    },
    text: { control: 'text', description: 'Try your own copy, at the length it will really be.' },
    element: {
      control: { type: 'select' },
      options: playgroundElements,
      description: 'The rendered tag. Independent of the class, which only sets appearance.',
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Pick a role and size, edit the text, and copy the snippet. The tag control is separate from the class on purpose: the class never sets document structure.',
      },
      source: {
        transform: (_code: string, context: { args: TypographyPlaygroundProps }) => {
          const { role, size, text, element } = context.args;
          return `<${element} className="text-${role}-${size}">${text}</${element}>`;
        },
      },
    },
  },
};
