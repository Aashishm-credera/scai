import type { RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BaseContainer } from '@/design-system/atoms/BaseContainer/BaseContainer';
import {
  EmergencyCallout,
  type EmergencyCalloutProps,
} from '@/design-system/molecules/EmergencyCallout';

const titleField: TextField = { value: 'Call emergency services immediately' };
const descriptionField: RichTextField = {
  value: '<p>If someone is unresponsive and not breathing normally, call for emergency help.</p>',
};
const longTitleField: TextField = {
  value: 'Recognize the signs and take immediate action when an emergency occurs',
};
const longDescriptionField: RichTextField = {
  value:
    '<p>If someone is unresponsive and not breathing normally, call for emergency help. Stay with them and follow the dispatcher’s instructions until help arrives.</p>',
};

const meta = {
  title: 'Molecules/Emergency Callout',
  component: EmergencyCallout,
  tags: [],
  args: {
    Icon: 'interface/alerts-feedback/alert-circle',
    TitleField: titleField,
    DescriptionField: descriptionField,
    isPageEditing: false,
  },
  argTypes: {
    Icon: { control: 'text', description: 'Approved Sitecore Design System icon name.' },
    id: { control: 'text' },
    TitleField: { control: 'object' },
    DescriptionField: { control: 'object' },
    className: { control: 'text' },
    isPageEditing: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Responsive emergency guidance callout with a Sitecore-provided icon, Text heading, and RichText description. Uses the error feedback, spacing, radius, typography, and layout-width tokens.',
      },
    },
  },
} satisfies Meta<typeof EmergencyCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  render: () => (
    <article className="grid max-w-(--abc-layout-width-640) gap-(--abc-spacing-gap-2xl) text-body-md text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-sm)">
        <h2 className="text-heading-md font-bold">Emergency Callout</h2>
        <p>
          Use this component for concise emergency guidance. The heading is rendered with the
          Sitecore <code>Text</code> component and the description with <code>RichText</code>, so
          authored emphasis and paragraph markup remain semantic.
        </p>
      </header>
      <section className="grid gap-(--abc-spacing-gap-sm)">
        <h3 className="text-heading-xs font-bold">Responsive layout</h3>
        <p>
          The callout follows the custom container and 12-column grid. It remains fluid on narrow
          viewports, caps at the 640px layout token, and occupies six grid columns at the
          extra-large breakpoint. Use the Storybook viewport toolbar to check the responsive
          behavior.
        </p>
      </section>
      <section className="grid gap-(--abc-spacing-gap-sm)">
        <h3 className="text-heading-xs font-bold">Design tokens</h3>
        <p>
          The surface, subtle error border, extra-large radius, inset spacing, minimum height, and
          typography are sourced from the abc design tokens.
        </p>
      </section>
    </article>
  ),
  parameters: {
    controls: { disable: true },
  },
};

export const Gallery: Story = {
  render: () => (
    <BaseContainer>
      <div className="grid grid-cols-1 justify-items-start gap-(--abc-spacing-gap-lg) xl:grid-cols-2">
        <EmergencyCallout
          Icon="interface/alerts-feedback/alert-triangle"
          TitleField={titleField}
          DescriptionField={descriptionField}
        />
        <EmergencyCallout
          Icon="pictoral/heart-alert"
          TitleField={longTitleField}
          DescriptionField={longDescriptionField}
        />
        <EmergencyCallout
          Icon="interface/alerts-feedback/alert-circle"
          TitleField={{ value: 'Call for emergency help' }}
          DescriptionField={{
            value: '<p>Stay with the person until emergency responders arrive.</p>',
          }}
        />
      </div>
    </BaseContainer>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Compares the multicolor Pictoral heart-alert with its monochrome stroke counterpart, plus a compact example.',
      },
    },
  },
};

export const BackendRendering: Story = {
  render: () => (
    <article className="grid max-w-4xl gap-(--abc-spacing-gap-2xl) text-body-md text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-sm)">
        <h2 className="text-heading-md font-bold">Sitecore rendering handoff</h2>
        <p>
          The frontend receives resolved fields from the Sitecore rendering. The UI component
          displays the icon name, title field, description field, and editing state; datasource
          lookup remains in the rendering adapter.
        </p>
      </header>
      <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-(--abc-spacing-inset-lg)">
        <code>{`const datasource = getDatasource(fields);
const iconName = getIconName(getFieldValue(datasource.Icon));
const title = getFieldValue(datasource.Title);
const description = getFieldValue(datasource.Description);

<EmergencyCallout
  Icon={iconName}
  TitleField={title}
  DescriptionField={description}
  isPageEditing={page.mode.isEditing}
/>`}</code>
      </pre>
    </article>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Documents the existing backend-to-frontend field handoff without changing it.',
      },
    },
  },
};

export const Playground: Story = {
  args: {
    Icon: 'interface/alerts-feedback/alert-circle',
    TitleField: titleField,
    DescriptionField: descriptionField,
    isPageEditing: false,
  } satisfies EmergencyCalloutProps,
};
