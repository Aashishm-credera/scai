import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect } from 'storybook/preview-api';

import { ParallaxBackdrop } from '@/design-system/atoms/ParallaxBackdrop';
import { abcIcon } from '@/design-system/design/icons';
import {
  GuideHeader,
  MAX_GUIDE_DESCRIPTION_LENGTH,
  MAX_GUIDE_STATUS_LENGTH,
  MAX_GUIDE_TITLE_LENGTH,
  type GuideHeaderProps,
} from '@/design-system/organisms/GuideHeader';
import { GuideHeaderDocumentation } from './GuideHeaderDocumentation';

const storyImage = '/story-assets/guide-header-blood-pressure.png';

const breadcrumbItems = [
  { title: 'Home', url: '/' },
  { title: 'Health information', url: '/health-information' },
  { title: 'Conditions', url: '/health-information/conditions' },
];

type GuideHeaderStoryArgs = Omit<
  GuideHeaderProps,
  'image' | 'status' | 'title' | 'description'
> & {
  title?: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  focalPointX: number;
  focalPointY: number;
  statusLabel: string;
  statusDate: string;
};

const defaultStoryArgs: GuideHeaderStoryArgs = {
  id: 'storybook-guide-header',
  metadata: { componentName: 'GuideHeader' },
  imageSrc: storyImage,
  imageAlt: 'Person having their blood pressure measured at a table',
  imageWidth: 4096,
  imageHeight: 2730,
  focalPointX: 50,
  focalPointY: 50,
  title: 'High Blood Pressure Guide',
  description:
    'A practical guide to understanding blood pressure numbers, knowing when to act, and building a care plan that can fit real life.',
  statusLabel: 'Medically verified',
  statusDate: 'May 2027',
  updatedLabel: 'Updated',
  breadcrumbItems,
};

function toGuideHeaderProps({
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  focalPointX,
  focalPointY,
  statusLabel,
  statusDate,
  ...args
}: GuideHeaderStoryArgs): GuideHeaderProps {
  return {
    ...args,
    image: (
      <ParallaxBackdrop
        className="h-[482px] w-full flex-none md:h-[622px] lg:absolute lg:inset-0 lg:h-[744px]"
        image={
          <img
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${focalPointX}% ${focalPointY}%`,
            }}
          />
        }
      />
    ),
    status: {
      label: statusLabel,
      date: statusDate,
      icon: <abcIcon name="interface/general/check" size="sm" />,
    },
  };
}

const meta = {
  title: 'Organisms/Guide Header',
  component: GuideHeader,
  tags: ['autodocs'],
  args: defaultStoryArgs,
  render: (args) => <GuideHeader {...toGuideHeaderProps(args)} />,
  decorators: [
    (Story) => (
      <div className="w-full min-w-0 max-w-full overflow-x-clip">
        <Story />
      </div>
    ),
    (Story) => {
      const [args, updateArgs] = useArgs<GuideHeaderStoryArgs>();

      useEffect(() => {
        const title = args.title?.slice(0, MAX_GUIDE_TITLE_LENGTH);
        const description = args.description?.slice(0, MAX_GUIDE_DESCRIPTION_LENGTH);
        const statusLabel = args.statusLabel.slice(0, MAX_GUIDE_STATUS_LENGTH);

        if (
          title !== args.title ||
          description !== args.description ||
          statusLabel !== args.statusLabel
        ) {
          updateArgs({ title, description, statusLabel });
        }
      }, [args.description, args.statusLabel, args.title, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Responsive guide-page header with React-node content slots, a parallax image slot, a semantic H1, optional status metadata, and an optional Breadcrumb slot.',
      },
    },
  },
  argTypes: {
    id: { control: false },
    className: { control: false },
    metadata: { control: false },
    breadcrumbItems: { control: false },
    title: {
      control: { type: 'text', maxLength: MAX_GUIDE_TITLE_LENGTH },
      description: `Page heading. Maximum ${MAX_GUIDE_TITLE_LENGTH} characters.`,
    },
    description: {
      control: { type: 'text', maxLength: MAX_GUIDE_DESCRIPTION_LENGTH },
      description: `Guide introduction. Maximum ${MAX_GUIDE_DESCRIPTION_LENGTH} characters.`,
    },
    imageSrc: {
      control: 'text',
      description: 'Image source URL. Long values remain inside the compact text control.',
    },
    imageAlt: { control: 'text', description: 'Image alternative text.' },
    imageWidth: { control: { type: 'number', min: 1, step: 1 } },
    imageHeight: { control: { type: 'number', min: 1, step: 1 } },
    focalPointX: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Horizontal image focal point from 0 to 100.',
    },
    focalPointY: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Vertical image focal point from 0 to 100.',
    },
    statusLabel: {
      control: { type: 'text', maxLength: MAX_GUIDE_STATUS_LENGTH },
      description: `Optional status label. Maximum ${MAX_GUIDE_STATUS_LENGTH} characters.`,
    },
    statusDate: { control: 'text', description: 'Optional localized status date.' },
    updatedLabel: { control: 'text', description: 'Localized label preceding the status date.' },
  },
} satisfies Meta<GuideHeaderStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid gap-(--abc-spacing-gap-4xl) bg-(--abc-surface-default-secondary) pb-(--abc-spacing-inset-4xl)">
      <section>
        <h2 id="complete-guide-header" className="sr-only">
          Complete Guide Header
        </h2>
        <GuideHeader {...toGuideHeaderProps(args)} />
      </section>
      <section>
        <h2 id="simple-guide-header" className="sr-only">
          Without optional Breadcrumb and status
        </h2>
        <GuideHeader
          {...toGuideHeaderProps(args)}
          id="storybook-guide-header-simple"
          breadcrumbItems={undefined}
          status={undefined}
        />
      </section>
    </div>
  ),
};

export const Documentation: Story = {
  parameters: { controls: { disable: true } },
  render: () => <GuideHeaderDocumentation />,
};

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Edit the title, description, focal point, image metadata, and optional status. Use the viewport toolbar to compare mobile, tablet, desktop, and large layouts.',
      },
    },
  },
};
