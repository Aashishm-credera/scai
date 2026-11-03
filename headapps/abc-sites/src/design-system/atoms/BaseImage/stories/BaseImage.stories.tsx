import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  BaseImage,
  IMAGE_ALIGNMENTS,
  IMAGE_ASPECT_RATIOS,
  IMAGE_SIZES,
  type ImageAlignment,
  type ImageAspectRatio,
} from '@/design-system/atoms/BaseImage';

/**
 * Sample images are test cards, not photos: each has an off-centre "Subject" marker, which makes
 * cropping and focal-point behaviour visible at a glance.
 *
 * Stories pass a plain `<img>`. The Sitecore rendering passes the SDK's `NextImage` in the same
 * slot, so what is checked here is what authors get, minus the Pages editing chrome.
 */
const SAMPLES = {
  landscape: { src: '/story-assets/landscape.svg', width: 1600, height: 1000 },
  portrait: { src: '/story-assets/portrait.svg', width: 1000, height: 1250 },
};

/**
 * Free form means "no aspect ratio at all". An empty-string option shows as a blank entry in the
 * dropdown, so the control uses this value, labelled, and the story maps it back to undefined.
 */
const FREE_FORM = 'free';

type ImageStoryArgs = {
  image: keyof typeof SAMPLES;
  alt: string;
  caption: string;
  tooltipText: string;
  objectPosition: string;
  aspectRatio: ImageAspectRatio | typeof FREE_FORM;
  align: ImageAlignment;
  fullWidth: boolean;
};

function StoryImage(args: ImageStoryArgs) {
  const { src, width, height } = SAMPLES[args.image];

  return (
    <BaseImage
      image={
        // eslint-disable-next-line @next/next/no-img-element -- stories render outside Next.js
        <img
          src={src}
          alt={args.alt}
          width={width}
          height={height}
          sizes={IMAGE_SIZES}
          style={args.objectPosition ? { objectPosition: args.objectPosition } : undefined}
        />
      }
      caption={args.caption || undefined}
      tooltipText={args.tooltipText || undefined}
      aspectRatio={args.aspectRatio === FREE_FORM ? undefined : args.aspectRatio}
      align={args.align}
      fullWidth={args.fullWidth}
    />
  );
}

/** Inline variants sit inside a column in real use, so show them at a column-like width. */
const inColumn: Decorator = (Story) => (
  <div className="max-w-xl">
    <Story />
  </div>
);

const DEFAULT_ARGS: ImageStoryArgs = {
  image: 'landscape',
  alt: 'Test card with a red subject marker, right of centre',
  caption: '',
  tooltipText: '',
  objectPosition: '',
  aspectRatio: '5:4',
  align: 'full',
  fullWidth: false,
};

const meta = {
  title: 'Atoms/Image',
  render: StoryImage,
  args: DEFAULT_ARGS,
  parameters: {
    docs: {
      description: {
        component: `An image that fills the width of whatever it is placed in, keeps the chosen aspect
ratio, and crops with \`object-fit: cover\`, centred on the focal point if one is set.

A caption appears under the image when one is given, and an info icon appears on the image when
tooltip text is given. Leave either empty and it does not show.

Screen readers hear the alt text first and then the caption. Authors place this as the **Image**
rendering in Sitecore.`,
      },
    },
  },
  argTypes: {
    image: { control: 'inline-radio', options: Object.keys(SAMPLES) },
    alt: {
      description:
        'Describes the image for screen readers. Write what it shows, or leave it empty for a purely decorative image.',
    },
    caption: { description: 'Optional text shown under the image. Hidden when empty.' },
    tooltipText: {
      description:
        'Optional extra information, opened from an info icon on the image. The icon is hidden when this is empty.',
    },
    objectPosition: {
      description:
        'The part of the image to keep in frame when it is cropped, e.g. "75% 42%". Centre by default.',
    },
    aspectRatio: {
      description:
        'The shape the image is cropped to. On phones only 5:4 and 4:5 are used, so 3:2 and 16:9 show as 5:4. Free form keeps the image uncropped.',
      control: { type: 'select', labels: { [FREE_FORM]: 'Free form (no crop)' } },
      options: [FREE_FORM, ...IMAGE_ASPECT_RATIOS],
    },
    align: {
      description:
        'Where the image sits. Full spans the container. Left, right and center take half of it on wider screens, and span it on phones and tablets.',
      control: 'inline-radio',
      options: IMAGE_ALIGNMENTS,
    },
    fullWidth: {
      description:
        'Spans the full content width, with space above and below. For an image used as its own section.',
    },
  },
} satisfies Meta<ImageStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The basic image: fills its container, cropped to the chosen aspect ratio. */
export const Default: Story = { name: 'Image', decorators: [inColumn] };

/** Tooltip text is given, so the info icon appears. Hover, focus or tap it to read the text. */
export const WithTooltip: Story = {
  decorators: [inColumn],
  args: { tooltipText: 'Photo taken at a community heart health screening.' },
};

/** A caption under the image. It is as wide as the image and wraps onto new lines if needed. */
export const WithCaption: Story = {
  decorators: [inColumn],
  args: { caption: 'Caption text goes here and here' },
};

/**
 * The full-width variant, for an image used as its own section: it spans the content width, with
 * space above and below.
 */
export const WithCaptionFullWidth: Story = {
  parameters: { layout: 'fullscreen' },
  args: { caption: 'Caption text goes here and here', aspectRatio: '16:9', fullWidth: true },
};

/**
 * Every shape available, side by side. Switch the viewport toolbar to Mobile to see 3:2 and 16:9
 * become 5:4, since phones only use 5:4 and 4:5.
 */
export const AspectRatios: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid gap-abc-spacing-gap-lg md:grid-cols-2">
      {IMAGE_ASPECT_RATIOS.map((aspectRatio) => (
        <StoryImage key={aspectRatio} {...args} aspectRatio={aspectRatio} caption={aspectRatio} />
      ))}
    </div>
  ),
};

/**
 * Every Image Alignment option, one under the other. Left, right and center take half the width
 * from 1024px up; switch the viewport toolbar to Mobile or Tablet to see them span it instead.
 */
export const Alignments: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid gap-abc-spacing-gap-lg">
      {IMAGE_ALIGNMENTS.map((align) => (
        <StoryImage key={align} {...args} align={align} caption={align} />
      ))}
    </div>
  ),
};

/**
 * The same tall crop of a wide image, twice. On the left it is centred and the subject is cut off.
 * On the right the focal point is on the subject, so it stays in frame.
 */
export const FocalPoint: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid max-w-2xl grid-cols-2 gap-abc-spacing-gap-lg">
      <StoryImage {...args} aspectRatio="4:5" caption="Centred, the default" />
      <StoryImage
        {...args}
        aspectRatio="4:5"
        objectPosition="75% 42%"
        caption="Focal point on the subject"
      />
    </div>
  ),
};

/**
 * Free form: no aspect ratio, so the image keeps its own shape and nothing is cropped away. This
 * is the default for authors, because cropping an image like a symptoms infographic could cut off
 * the very information it exists to show.
 */
export const FreeForm: Story = {
  decorators: [inColumn],
  args: {
    image: 'portrait',
    alt: 'Portrait test card with a purple subject marker',
    aspectRatio: FREE_FORM,
  },
};

/** A caption longer than the image is wide wraps onto new lines instead of being cut off. */
export const LongCaption: Story = {
  decorators: [inColumn],
  args: {
    caption:
      'Caption text that runs longer than the image is wide, to show that it wraps onto a new line instead of overflowing or being cut off.',
  },
};

/**
 * A purely decorative image has empty alt text, so screen readers skip it rather than announcing
 * a description that adds nothing.
 */
export const DecorativeImage: Story = {
  decorators: [inColumn],
  args: { alt: '' },
};
