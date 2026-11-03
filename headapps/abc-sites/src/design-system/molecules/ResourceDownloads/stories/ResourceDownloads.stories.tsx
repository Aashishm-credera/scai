import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ResourceDownloads } from '../ResourceDownloads';
import { downloadItems, resourceDownloadsFields } from './resource-downloads.fixtures';
import './ResourceDownloads.stories.css';

const ctaName = 'Download the heart health guide PDF';
const navigationName = 'Available heart health PDFs';

const meta = {
  title: 'Molecules/Resource Downloads',
  component: ResourceDownloads,
  args: { fields: resourceDownloadsFields(), isEditing: false },
  decorators: [
    (Story) => (
      <div className="resource-downloads-story p-(--abc-spacing-inset-xl)">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      context: { include: ['body'], exclude: ['[data-base-ui-focus-guard]'] },
      config: { checks: [{ id: 'aria-valid-attr-value', options: ['aria-controls'] }] },
    },
    docs: {
      description: {
        component:
          'Editable Sitecore PDF download banner. Reuses the secondary BaseButton action and LinkDropdown. Figma reference widths: 390, 768, 1280, and 1600px; application breakpoints: 480, 1024, and 1600px. Downloads use a local Storybook PDF fixture.',
      },
    },
  },
} satisfies Meta<typeof ResourceDownloads>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultContent: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent(
      'The downloadable file label goes here'
    );
    await expect(canvas.getByRole('button', { name: ctaName })).toHaveClass('secondary-button');
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
  },
};

export const BannerWithSingleDownloadOption: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: ctaName });
    await expect(trigger).not.toHaveAttribute('aria-haspopup');
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('PDF download started.')
    );
    await expect(trigger).toBeEnabled();
  },
};

export const BannerWithMultipleDownloadOptions: Story = {
  args: { fields: resourceDownloadsFields({ downloads: { results: downloadItems } }) },
  render: (args) => (
    <>
      <ResourceDownloads {...args} />
      <button type="button" className="mt-(--abc-spacing-inset-xl)">
        Continue after downloads
      </button>
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: ctaName });
    const outside = canvas.getByRole('button', { name: 'Continue after downloads' });
    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await body.findByRole('navigation', { name: navigationName });
    await userEvent.click(outside);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await userEvent.click(trigger);
    const navigation = within(await body.findByRole('navigation', { name: navigationName }));
    await expect(navigation.getAllByRole('link')).toHaveLength(2);
    await userEvent.click(navigation.getByRole('link', { name: 'Heart health guide (Spanish)' }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('PDF download started.')
    );
  },
};

export const MissingDatasource: Story = {
  args: { fields: { data: { datasource: null } } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
  },
};

export const OptionalFieldsOmitted: Story = {
  args: {
    fields: resourceDownloadsFields({
      description: undefined,
      image: undefined,
      ctaAriaLabel: undefined,
      navigationLabel: undefined,
    }),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Download PDF' })).toBeEnabled();
    await expect(canvas.queryByText(/Lorem ipsum/)).not.toBeInTheDocument();
  },
};

export const NoDownloadsAssigned: Story = {
  args: { fields: resourceDownloadsFields({ downloads: { results: [] } }) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: ctaName })).toBeDisabled();
  },
};

export const EditingMode: Story = {
  args: {
    isEditing: true,
    fields: resourceDownloadsFields({
      title: {
        jsonValue: {
          value: 'Editable resource title',
          metadata: { fieldId: 'resource-title' },
        },
      },
      description: {
        jsonValue: {
          value: 'Editable optional description',
          metadata: { fieldId: 'resource-description' },
        },
      },
    }),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Editable resource title')).toBeVisible();
    await expect(canvas.getByText('Editable optional description')).toBeVisible();
    await expect(canvas.getByRole('button', { name: ctaName })).toBeDisabled();
  },
};

export const EditingModeMissingDatasource: Story = {
  args: { isEditing: true, fields: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Resource Downloads: assign a datasource.')).toBeVisible();
  },
};

export const Mobile390: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } };
export const Tablet768: Story = { globals: { viewport: { value: 'md', isRotated: false } } };
export const Desktop1280: Story = { globals: { viewport: { value: 'lg', isRotated: false } } };
export const Large1600: Story = { globals: { viewport: { value: 'xl', isRotated: false } } };

export const LongTextWrapping: Story = {
  args: {
    fields: resourceDownloadsFields({
      title: {
        jsonValue: {
          value:
            'A comprehensive guide to understanding your heart health and managing cardiovascular risk',
        },
      },
      description: {
        jsonValue: {
          value:
            'Explore practical advice, questions to discuss with your healthcare team, and everyday changes that support long-term heart health. This longer description exercises content reflow without truncation or a fixed height.',
        },
      },
      ctaLabel: { jsonValue: { value: 'Download the complete heart health resource PDF' } },
    }),
  },
};

export const VerticalPdfThumbnail: Story = {
  args: {
    fields: resourceDownloadsFields({
      image: {
        jsonValue: {
          value: { src: '/story-assets/portrait.svg', width: 600, height: 800, alt: '' },
        },
      },
    }),
  },
};

export const HorizontalPdfThumbnail: Story = {
  args: {
    fields: resourceDownloadsFields({
      image: {
        jsonValue: {
          value: { src: '/story-assets/landscape.svg', width: 800, height: 600, alt: '' },
        },
      },
    }),
  },
};

export const Hover: Story = {
  play: async ({ canvas }) => {
    await userEvent.hover(canvas.getByRole('button', { name: ctaName }));
  },
};

export const FocusVisible: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    const trigger = canvas.getByRole('button', { name: ctaName });
    await expect(trigger).toHaveFocus();
    await expect(trigger.matches(':focus-visible')).toBe(true);
  },
};

export const Pressed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Press and hold the download CTA in the canvas to inspect its native :active treatment. The surface uses the shared BaseButton scale and elevation tokens.',
      },
    },
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: ctaName });
    await userEvent.pointer({ target: trigger, keys: '[MouseLeft>]' });
    // Synthetic pointer events cannot set the browser's native :active pseudo-class.
    // Hold the mouse button in the canvas to inspect the actual pressed treatment.
  },
};
