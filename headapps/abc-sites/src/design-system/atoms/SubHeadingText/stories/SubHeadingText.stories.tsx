import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { SubHeadingText, type SubHeadingProps } from '../../SubHeadingText';
import { Default as SubHeadingTextRendering } from '@/components/features/PageContent/SubHeadingText/SubHeadingText';
import type { SubHeadingTextRenderingProps } from '@/components/features/PageContent/SubHeadingText/sub-heading-text.props';

const DEFAULT_TEXT = 'Healthy heart';
const MAX_SUB_HEADING_LENGTH = 120;

const createProps = (value: string, isEditing = false): SubHeadingProps => ({
  SubHeadingField: { value },
  isEditing,
});

const createRenderingProps = (isEditing: boolean, value: string): SubHeadingTextRenderingProps => ({
  rendering: {} as SubHeadingTextRenderingProps['rendering'],
  params: {},
  page: {
    layout: {} as SubHeadingTextRenderingProps['page']['layout'],
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
  fields: { data: { datasource: { SubHeading: { value } } } },
});

/** Simulates the Sitecore Page Builder field editor; the UI atom itself does not limit text. */
function TextPlayground() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const remainingCharacters = MAX_SUB_HEADING_LENGTH - text.length;

  return (
    <div className="grid w-full max-w-(--abc-layout-width-560) gap-(--abc-spacing-gap-md)">
      <label className="grid gap-(--abc-spacing-gap-xs)">
        <span className="font-bold">Sub-heading text</span>
        <input
          aria-describedby="sub-heading-character-count"
          maxLength={MAX_SUB_HEADING_LENGTH}
          onChange={(event) => setText(event.target.value)}
          value={text}
        />
      </label>
      <p aria-live="polite" id="sub-heading-character-count">
        {remainingCharacters} characters remaining (maximum {MAX_SUB_HEADING_LENGTH})
      </p>
      <SubHeadingText {...createProps(text, true)} />
    </div>
  );
}

const meta = {
  title: 'Atoms/Sub-Heading Text',
  component: SubHeadingText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A semantic **Sub-Heading Text** treatment for context beneath a section heading. Figma specifies the responsive \`Heading/sm\` token, \`--abc-text-default-primary\`, 700 weight, and no border, radius, padding, or shadow.

The Sitecore rendering supplies a compatible Rich Text field and editing state. The Sitecore field editor owns the 120-character maximum. The server rendering sanitizes published markup; this UI atom renders the supplied field. Rendering never truncates content: it fills the available parent width and wraps naturally.

The component is an \`h3\` and uses the responsive \`Heading/s\` token for Figma mobile and desktop layouts.`,
      },
    },
  },
  argTypes: {
    SubHeadingField: {
      control: 'object',
      description: 'Rich Text field supplied by the Sitecore rendering.',
    },
    isEditing: { control: 'boolean' },
    className: {
      control: 'text',
      description:
        'Optional layout class. Keep natural wrapping and the supplied semantic tokens intact.',
    },
  },
  args: createProps(DEFAULT_TEXT),
  decorators: [
    (Story) => (
      <div className="w-full max-w-(--abc-layout-width-560)">
        <h2 className="sr-only">Example section</h2>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SubHeadingText>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Typical published rendering. */
export const Default: Story = {
  args: createProps(DEFAULT_TEXT),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Example section' })
    ).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { level: 3 })).toBeVisible();
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
        {`// Sitecore rendering: PageContent/SubHeadingText/SubHeadingText.tsx
const subHeading = getFieldValue(datasource.SubHeading);
const sanitizedSubHeading = sanitizeHeadingHtml(subHeading?.value);

<SubHeadingText
  SubHeadingField={isEditing ? subHeading : { ...subHeading, value: sanitizedSubHeading }}
  isEditing={isEditing}
  id={params.RenderingIdentifier || undefined}
  className={params.styles?.trim() || undefined}
/>`}
      </pre>
    </div>
  ),
};

export const PageBuilderLongSubHeading: Story = {
  render: () => (
    <SubHeadingTextRendering {...createRenderingProps(true, 'Healthy heart '.repeat(10))} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/longer than 120 characters/)).toBeNull();
  },
};

/** Interactive Sitecore field-editor simulation; the UI atom itself does not limit text. */
export const Playground: Story = {
  render: () => <TextPlayground />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Sub-heading text' });
    const maximumText = 'a'.repeat(MAX_SUB_HEADING_LENGTH);

    await userEvent.clear(input);
    await userEvent.type(input, `${maximumText}b`);
    await expect(input).toHaveAttribute('maxlength', String(MAX_SUB_HEADING_LENGTH));
    await expect(input).toHaveValue(maximumText);
    await expect(canvas.getByText('0 characters remaining (maximum 120)')).toBeVisible();
    await expect(canvas.getByRole('heading', { level: 3 })).toHaveClass(
      'text-[length:var(--abc-font-size-heading-sm)]'
    );
  },
};
