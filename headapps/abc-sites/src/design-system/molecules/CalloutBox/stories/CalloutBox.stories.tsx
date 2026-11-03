import type { RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  CalloutBox,
  type CalloutBoxUIProps,
  type ContentSdkLinkField,
} from '@/design-system/molecules/CalloutBox';

const titleField: TextField = { value: 'Title goes here lorem ipsum dolor' };
const linkField: ContentSdkLinkField = {
  value: {
    href: '/heart-health',
    linktype: 'internal',
    text: 'Learn about the differences',
  },
};
const paragraphDescription: RichTextField = {
  value:
    '<p>Lorem ipsum dolor sit amet consectetur. Rhoncus pharetra ut orci venenatis ullamcorper nec dui. Venenatis non enim tincidunt dignissim feugiat volutpat viverra velit duis.</p>',
};
const bulletedDescription: RichTextField = {
  value: `<ul>${Array.from(
    { length: 4 },
    () =>
      '<li>Lorem ipsum dolor sit amet consectetur. Rhoncus pharetra ut orci venenatis ullamcorper nec dui.</li>'
  ).join('')}</ul>`,
};
const numberedDescription: RichTextField = {
  value: `<ol>${Array.from(
    { length: 3 },
    () =>
      '<li>Lorem ipsum dolor sit amet consectetur. Rhoncus pharetra ut orci venenatis ullamcorper nec dui.</li>'
  ).join('')}</ol>`,
};
const tones = [
  { name: 'Neutral', styles: 'callout-title-neutral' },
  { name: 'Negative', styles: 'callout-title-negative' },
  { name: 'Success', styles: 'callout-title-success' },
] as const;
const iconByTone = [
  'interface/users/users-01',
  'interface/alerts-feedback/alert-circle',
  'interface/files/clipboard-check',
] as const;

const galleryExamples = [
  { name: 'Paragraph', description: paragraphDescription, showIcon: false },
  { name: 'Paragraph with icon', description: paragraphDescription, showIcon: true },
  { name: 'Bulleted list', description: bulletedDescription, showIcon: false },
  { name: 'Numbered list', description: numberedDescription, showIcon: false },
] as const;

const meta = {
  title: 'Molecules/Callout Box',
  component: CalloutBox,
  tags: ['autodocs'],
  args: {
    Icon: iconByTone[0],
    LinkField: linkField,
    TitleField: titleField,
    DescriptionField: paragraphDescription,
    styles: 'callout-title-neutral',
    isPageEditing: false,
  },
  argTypes: {
    Icon: { control: 'text', description: 'Allowlisted Sitecore icon registry name.' },
    id: { control: 'text' },
    LinkField: { control: 'object' },
    TitleField: { control: 'object' },
    DescriptionField: { control: 'object' },
    styles: {
      control: 'select',
      options: tones.map(({ styles }) => styles),
      description: 'Sitecore style-option class for the title treatment.',
    },
    isPageEditing: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Responsive Callout Box UI. Sitecore resolves the datasource, validates the link, and sanitizes the description before supplying these props. Use `callout-title-neutral`, `callout-title-negative`, or `callout-title-success` to select the title tone.',
      },
    },
  },
} satisfies Meta<typeof CalloutBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  render: () => <CalloutBoxDocumentation />,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'How the Sitecore rendering prepares data for this frontend UI component.',
      },
    },
  },
};

function CalloutBoxDocumentation() {
  const example = `<CalloutBox
  Icon={iconName}
  TitleField={titleField}
  DescriptionField={descriptionField}
  LinkField={linkField}
  styles="callout-title-negative"
  isPageEditing={isEditing}
/>`;

  return (
    <article className="grid max-w-4xl gap-6 text-body-md text-(--abc-text-default-primary)">
      <header className="grid gap-2">
        <h2 className="text-heading-md font-bold">Callout Box frontend and Sitecore rendering</h2>
        <p>
          This molecule only displays prepared props. The Sitecore rendering resolves the datasource
          and field wrappers, validates the icon and CTA, and sanitizes published description HTML
          before rendering this component.
        </p>
      </header>
      <section className="grid gap-2">
        <h3 className="text-heading-xs font-bold">Backend-to-frontend handoff</h3>
        <p>
          Pass the resolved values as <code>Icon</code>, <code>TitleField</code>,{' '}
          <code>DescriptionField</code>, and <code>LinkField</code>. Keep Sitecore editing state in{' '}
          <code>isPageEditing</code>, so empty fields can still be shown to authors. Do not pass a
          raw datasource or move validation into the UI molecule.
        </p>
        <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-(--abc-spacing-inset-lg)">
          <code>{example}</code>
        </pre>
      </section>
      <section className="grid gap-2">
        <h3 className="text-heading-xs font-bold">Style options</h3>
        <p>
          Set the rendering styles to <code>callout-title-neutral</code>,{' '}
          <code>callout-title-negative</code>, or <code>callout-title-success</code>. Neutral is the
          default when no recognized tone is supplied.
        </p>
      </section>
      <section className="grid gap-2">
        <h3 className="text-heading-xs font-bold">Responsive layout</h3>
        <p>
          The card follows the design widths: up to 485px at the base breakpoint, 756px from
          <code>md</code>, and 924px from <code>xl</code>. The CTA uses the responsive Figma
          <code>Label/md</code> typography. Use Storybook&apos;s viewport toolbar to check the
          component at each breakpoint.
        </p>
      </section>
    </article>
  );
}

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-(--abc-spacing-gap-lg) md:grid-cols-2 xl:grid-cols-3">
      {galleryExamples.flatMap((example) =>
        tones.map((tone, index) => (
          <CalloutBox
            key={`${example.name}-${tone.name}`}
            TitleField={titleField}
            DescriptionField={example.description}
            LinkField={linkField}
            Icon={example.showIcon ? iconByTone[index] : undefined}
            styles={tone.styles}
          />
        ))
      )}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Figma-inspired gallery of paragraph, paragraph with icon, bulleted list, and numbered list examples in neutral, negative, and success tones.',
      },
    },
  },
};

export const Playground: Story = {
  args: {
    Icon: iconByTone[0],
    TitleField: titleField,
    DescriptionField: paragraphDescription,
    LinkField: linkField,
    styles: 'callout-title-neutral',
    isPageEditing: false,
  } satisfies CalloutBoxUIProps,
};
