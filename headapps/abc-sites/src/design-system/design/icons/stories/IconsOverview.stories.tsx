import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect } from 'storybook/preview-api';
import { IconDocumentation } from './IconDocumentation';
import { IconGallery } from './IconGallery';
import { IconPlayground, isIconColorApplicable, type IconPlaygroundProps } from './IconPlayground';
import { getIconHierarchyLabel, sortIconIdsByHierarchy } from './filter-icons';
import { iconDefinitions } from '../registry';
import { iconColors } from '../types';

const iconNameLabels = Object.fromEntries(
  iconDefinitions.map((icon) => [icon.id, getIconHierarchyLabel(icon)])
);

const meta = {
  title: 'Design/Icons',
  component: IconGallery,
  // Single story, or a gallery with its own layout. A Docs entry would only restate it.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'One searchable gallery for the shared abc icon registry. Application and Sitecore usage: `import { abcIcon, SitecoreIcon } from "@/design-system/design/icons"`.',
      },
    },
  },
} satisfies Meta<typeof IconGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Gallery: Story = {};

export const Documentation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Sitecore backend setup, Content SDK integration, accessibility, design tokens, and the start-of-sprint SVG workflow.',
      },
    },
  },
  render: () => <IconDocumentation />,
};

type IconPlaygroundStoryArgs = IconPlaygroundProps & {
  colorApplicable: boolean;
};

export const Playground: StoryObj<IconPlaygroundStoryArgs> = {
  args: {
    name: 'interface/general/search-lg',
    size: 'xl',
    color: 'brand-primary',
    colorApplicable: true,
    decorative: false,
    label: 'Search',
  },
  argTypes: {
    name: {
      control: { type: 'select', labels: iconNameLabels },
      options: sortIconIdsByHierarchy(iconDefinitions),
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    color: {
      control: { type: 'select' },
      options: iconColors,
      if: { arg: 'colorApplicable', truthy: true },
    },
    colorApplicable: { control: false, table: { disable: true } },
    decorative: { control: 'boolean' },
    label: {
      control: 'text',
      if: { arg: 'decorative', eq: false },
    },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        story:
          'Interactive icon preview with semantic foreground colors and the Storybook Light/Dark background toolbar for contrast checks. The color control is hidden for full-color artwork.',
      },
    },
  },
  decorators: [
    (Story) => {
      const [args, updateArgs] = useArgs<IconPlaygroundStoryArgs>();
      const colorApplicable = isIconColorApplicable(args.name);

      useEffect(() => {
        if (args.colorApplicable !== colorApplicable) {
          updateArgs({ colorApplicable });
        }
      }, [args.colorApplicable, colorApplicable, updateArgs]);

      return <Story />;
    },
  ],
  render: ({ colorApplicable: _colorApplicable, ...args }) => <IconPlayground {...args} />,
};
