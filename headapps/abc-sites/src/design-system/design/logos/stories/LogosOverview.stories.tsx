import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LogoDocumentation } from './LogoDocumentation';
import { LogoGallery } from './LogoGallery';
import { LogoPlayground, type LogoPlaygroundProps } from './LogoPlayground';
import { sortLogoIds } from './filter-logos';
import { logoDefinitions } from '../registry';
import { logoSizes, logoVariants } from '../types';

const meta = {
  title: 'Design/Logos',
  component: LogoGallery,
  // Single story, or a gallery with its own layout. A Docs entry would only restate it.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Approved abc and accreditation partner logos. Application and Sitecore usage: `import { abcLogo, SitecoreLogo } from "@/design-system/design/logos"`.',
      },
    },
  },
} satisfies Meta<typeof LogoGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Gallery: Story = {};

export const Documentation: Story = {
  render: () => <LogoDocumentation />,
};

export const Playground: StoryObj<LogoPlaygroundProps> = {
  args: {
    name: 'abc/wordmark',
    size: 'md',
    variant: 'default',
    decorative: false,
    label: 'American Heart Association',
  },
  argTypes: {
    name: {
      control: { type: 'select' },
      options: sortLogoIds(logoDefinitions),
    },
    size: {
      control: { type: 'select' },
      options: logoSizes,
    },
    variant: {
      control: { type: 'select' },
      options: logoVariants,
    },
    decorative: { control: 'boolean' },
    label: {
      control: 'text',
      if: { arg: 'decorative', eq: false },
    },
  },
  parameters: {
    controls: { disable: false },
  },
  render: (args) => <LogoPlayground {...args} />,
};
