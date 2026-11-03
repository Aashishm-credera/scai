import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LABEL_VARIANTS, Label } from '@/design-system/atoms/Label';

const meta = {
  title: 'Atoms/Label',
  component: Label,
  tags: [],
  args: {
    children: 'Recommended',
    icon: 'interface/general/check',
    iconPosition: 'left',
    variant: 'success',
  },
  argTypes: {
    children: { control: 'text' },
    icon: { control: 'text', description: 'Approved Sitecore Design System icon name.' },
    iconPosition: { control: 'select', options: ['none', 'left', 'right'] },
    variant: { control: 'select', options: LABEL_VARIANTS },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A compact, pill-shaped label for status or category text. Choose a design-system color variant and optionally add an approved icon before or after the text.',
      },
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BackendRendering: Story = {
  render: () => (
    <article className="grid max-w-4xl gap-(--abc-spacing-gap-2xl) text-body-md text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-sm)">
        <h2 className="text-heading-md font-bold">Sitecore rendering handoff</h2>
        <p>
          Label is a presentation component. A rendering resolves the Sitecore fields and passes the
          label text, color variant, and optional icon as props. The UI component does not perform
          datasource lookup.
        </p>
      </header>
      <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-(--abc-spacing-inset-lg)">
        <code>{`const labelItem = getDatasource(cell?.Label?.targetItem);
const text = getFieldValue(labelItem?.Text)?.value ?? '';
const color = getFieldValue(labelItem?.Color)?.value ?? 'neutral';
const icon = getIconName(getFieldValue(labelItem?.Icon));

<Label
  variant={isLabelVariant(color) ? color : 'neutral'}
  icon={icon}
  iconPosition={icon ? 'left' : 'none'}
>
  {text}
</Label>`}</code>
      </pre>
    </article>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Shows how Sitecore label fields are resolved before rendering the Label UI.',
      },
    },
  },
};

export const Gallery: Story = {
  render: () => {
    const iconForVariant = (variant: (typeof LABEL_VARIANTS)[number]): string => {
      switch (variant) {
        case 'success':
          return 'interface/general/check';
        case 'warning':
          return 'interface/alerts-feedback/alert-triangle';
        case 'error':
          return 'interface/alerts-feedback/alert-circle';
        case 'brand':
          return 'interface/general/heart';
        default:
          return 'interface/general/info-circle';
      }
    };

    return (
      <div className="grid gap-(--abc-spacing-gap-2xl)">
        <section className="grid gap-(--abc-spacing-gap-md)">
          <h2 className="text-heading-sm font-bold">All color variants with icons</h2>
          <div className="flex flex-wrap items-center gap-(--abc-spacing-gap-sm)">
            {LABEL_VARIANTS.map((variant) => (
              <Label
                key={variant}
                variant={variant}
                icon={iconForVariant(variant)}
                iconPosition="left"
              >
                {variant}
              </Label>
            ))}
          </div>
        </section>
        <section className="grid gap-(--abc-spacing-gap-md)">
          <h2 className="text-heading-sm font-bold">Icon positions</h2>
          <div className="flex flex-wrap items-center gap-(--abc-spacing-gap-sm)">
            <Label variant="success" icon="interface/general/check" iconPosition="left">
              Icon on the left
            </Label>
            <Label variant="brand" icon="interface/general/heart" iconPosition="right">
              Icon on the right
            </Label>
            <Label variant="neutral" icon="interface/general/info-circle" iconPosition="none">
              Text only
            </Label>
          </div>
        </section>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Displays every available color variant with an icon, plus examples of leading, trailing, and hidden icon positions.',
      },
    },
  },
};

export const Playground: Story = {
  args: {
    children: 'Approved',
    icon: 'interface/general/check',
    iconPosition: 'left',
    variant: 'success',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use the controls to try different label text, variants, approved icons, and icon positions.',
      },
    },
  },
};
