import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { HeadingText, type HeadingTextProps } from '../../HeadingText';
import { Default as HeadingTextRendering } from '@/components/features/PageContent/HeadingText/HeadingText';
import type { HeadingTextProps as HeadingTextRenderingProps } from '@/components/features/PageContent/HeadingText/heading-text.props';

const DEFAULT_TEXT = 'Heart health';
const MAX_HEADING_LENGTH = 25;

const createProps = (value: string, isEditing = false): HeadingTextProps => ({
  HeadingField: { value },
  isEditing,
});

const createRenderingProps = (isEditing: boolean, value: string): HeadingTextRenderingProps => ({
  rendering: {} as HeadingTextRenderingProps['rendering'],
  params: {},
  page: {
    layout: {} as HeadingTextRenderingProps['page']['layout'],
    locale: 'en',
    mode: {
      name: isEditing ? LayoutServicePageState.Edit : LayoutServicePageState.Normal,
      designLibrary: { isVariantGeneration: false },
      isNormal: !isEditing,
      isPreview: false,
      isEditing,
      isDesignLibrary: false,
    },
  },
  fields: { data: { datasource: { Heading: { value } } } },
});

/** Simulates the Sitecore Page Builder field editor; the UI atom itself does not limit text. */
function TextPlayground() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const remainingCharacters = MAX_HEADING_LENGTH - text.length;

  return (
    <div className="grid w-full max-w-(--abc-layout-width-560) gap-(--abc-spacing-gap-md)">
      <label className="grid gap-(--abc-spacing-gap-xs)">
        <span className="font-bold">Heading text</span>
        <input
          aria-describedby="heading-character-count"
          maxLength={MAX_HEADING_LENGTH}
          onChange={(event) => setText(event.target.value)}
          value={text}
        />
      </label>
      <p aria-live="polite" id="heading-character-count">
        {remainingCharacters} characters remaining (maximum {MAX_HEADING_LENGTH})
      </p>
      <HeadingText {...createProps(text, true)} />
    </div>
  );
}

const meta = {
  title: 'Atoms/Heading Text',
  component: HeadingText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A semantic **Heading Text** treatment for page sections. It uses the responsive \`Heading/lg\` typography tokens, primary text color, and pretty wrapping. Content wraps naturally and is never truncated.

The Sitecore rendering supplies a Rich Text field and editing state. The field supports copyright/trademark symbols and superscript/subscript markup. The 25-character limit is enforced by the Sitecore field validation rule. The server rendering sanitizes published markup; this UI renders the supplied field without frontend validation.`,
      },
    },
  },
  argTypes: {
    HeadingField: {
      control: 'object',
      description: 'Rich Text field supplied by the Sitecore rendering.',
    },
    isEditing: { control: 'boolean' },
    className: {
      control: 'text',
      description: 'Optional layout class. Content continues to wrap without truncation.',
    },
  },
  args: createProps(DEFAULT_TEXT),
} satisfies Meta<typeof HeadingText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: createProps(DEFAULT_TEXT),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: DEFAULT_TEXT })).toBeVisible();
  },
};

export const BackendRendering: Story = {
  render: () => (
    <div className="grid gap-4">
      <p>
        The Sitecore rendering reads the datasource and page mode, sanitizes published content, and
        renders this frontend atom:
      </p>
      <pre
        className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm"
        tabIndex={0}
      >
        {`// Sitecore rendering: PageContent/HeadingText/HeadingText.tsx
const heading = getFieldValue(datasource.Heading);
const sanitizedHeading = sanitizeHeadingHtml(heading?.value);

<HeadingText
  HeadingField={isEditing ? heading : { ...heading, value: sanitizedHeading }}
  isEditing={isEditing}
  id={params.RenderingIdentifier || undefined}
  className={params.styles?.trim() || undefined}
/>`}
      </pre>
    </div>
  ),
};

export const PageBuilderLongHeading: Story = {
  render: () => (
    <HeadingTextRendering {...createRenderingProps(true, 'Heart health is very important')} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/longer than 25 characters/)).toBeNull();
  },
};

export const Playground: Story = {
  render: () => <TextPlayground />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Heading text' });
    const maximumText = 'a'.repeat(MAX_HEADING_LENGTH);

    await userEvent.clear(input);
    await userEvent.type(input, `${maximumText}b`);
    await expect(input).toHaveAttribute('maxlength', String(MAX_HEADING_LENGTH));
    await expect(input).toHaveValue(maximumText);
    await expect(canvas.getByText('0 characters remaining (maximum 25)')).toBeVisible();
    await expect(canvas.getByRole('heading', { level: 2 })).toHaveClass('font-bold');
  },
};
