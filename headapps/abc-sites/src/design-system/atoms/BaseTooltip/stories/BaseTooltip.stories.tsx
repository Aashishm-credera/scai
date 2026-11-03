import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { abcIcon } from '@/design-system/design/icons';

import { BaseTooltip } from '@/design-system/atoms/BaseTooltip';

const TITLE = 'This is a tooltip';
const SUPPORTING =
  'Copies the current page address so you can paste the link into a message or document.';

/**
 * Shown on a help icon, as in Figma. The first three stories are for reading and playing with
 * on the docs page. The rest each test one line of the Figma interaction notes, plus tap, which
 * Figma leaves to implementation. They all look the same while closed, so they stay off the docs
 * page and live in the sidebar, where the Interactions panel shows each step.
 */
const meta = {
  title: 'Atoms/Tooltip',
  component: BaseTooltip,
  parameters: {
    docs: {
      description: {
        component: `A short label that appears when someone hovers over, focuses, or taps a small trigger such
as a help icon. Use it for brief, supporting information that is not essential to understand
the page.

It opens instantly on hover or keyboard focus, and stays open while the pointer is over the
trigger or the tooltip itself. Escape closes it. On phones, where nothing can be hovered, a tap
opens it and a second tap closes it.

Keep it to plain text. Links, buttons or anything else someone needs to interact with do not
belong in a tooltip; use a popover or dialog instead. The trigger must have its own accessible
name, such as \`aria-label="Help"\`, since screen readers read the tooltip text as a description
of it.`,
      },
    },
  },
  argTypes: {
    title: { description: 'The main text. Required. Keep it short.' },
    supportingText: {
      description: 'Optional second line with more detail, shown smaller and lighter.',
    },
    children: {
      description:
        'The trigger the tooltip belongs to, usually an icon button. Must be focusable and have its own accessible name.',
      control: false,
    },
  },
  args: {
    title: TITLE,
    children: (
      <button type="button" aria-label="Help" className="rounded-abc-radius-pill">
        <abcIcon name="interface/general/help-circle" size="lg" />
      </button>
    ),
  },
  // Room above the trigger, since the tooltip opens upwards.
  decorators: [
    (Story) => (
      <div className="flex min-h-48 items-end justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BaseTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

const trigger = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole('button', { name: 'Help' });

/**
 * The visual tooltip, found by its title. Base UI gives the popup no role, and it is aria-hidden
 * anyway, since screen readers get the text as the trigger's description.
 */
const tooltip = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).queryByText(TITLE, { selector: 'p' })?.parentElement ??
  null;

const opened = (canvasElement: HTMLElement) =>
  waitFor(() => expect(tooltip(canvasElement)).toBeVisible());

const closed = (canvasElement: HTMLElement) =>
  waitFor(() => expect(tooltip(canvasElement)).toBeNull());

/** The simplest tooltip: one line of text. Hover, focus or tap the icon to see it. */
export const TitleOnly: Story = {};

/** A title plus a second line of detail, shown smaller and lighter underneath. */
export const WithSupportingText: Story = { args: { supportingText: SUPPORTING } };

/**
 * Long text wraps onto new lines at 500px wide, or narrower on small screens. It is never cut off
 * and never makes the page scroll sideways.
 */
export const LongTextWraps: Story = {
  args: { supportingText: `${SUPPORTING} ${SUPPORTING} ${SUPPORTING}` },
  play: async ({ canvasElement }) => {
    await userEvent.hover(trigger(canvasElement));
    await opened(canvasElement);
    await expect(tooltip(canvasElement)!.getBoundingClientRect().width).toBeLessThanOrEqual(500);
  },
};

/** Opens with no hover delay, and the trigger shows a hand cursor. */
export const HoverToOpen: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(trigger(canvasElement)).cursor).toBe('pointer');

    await userEvent.hover(trigger(canvasElement));
    await opened(canvasElement);
    await expect(tooltip(canvasElement)).toHaveTextContent(TITLE);
  },
};

export const KeyboardFocusToOpen: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(trigger(canvasElement)).toHaveFocus();
    await opened(canvasElement);
  },
};

/** Figma: "Escape dismisses without moving focus." */
export const EscapeClosesWithoutMovingFocus: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await opened(canvasElement);

    await userEvent.keyboard('{Escape}');
    await closed(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

/**
 * What a browser dispatches for a tap. The test library's simulated touch does not reproduce it
 * closely enough to trigger the toggle; a real touchscreen (Playwright's iPhone profile) does,
 * and was checked to open on tap, close on a second tap, and close on a tap elsewhere.
 */
const tap = (element: HTMLElement) => {
  element.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true }));
  element.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }));
  element.click();
};

/** Nothing can be hovered on a phone, so a tap opens it and a second tap closes it. */
export const TapToToggle: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const button = trigger(canvasElement);

    tap(button);
    await opened(canvasElement);

    tap(button);
    await closed(canvasElement);
  },
};

/** Screen readers get the text as the trigger's description, even while the tooltip is closed. */
export const DescribesTheTrigger: Story = {
  tags: ['!autodocs'],
  args: { supportingText: SUPPORTING },
  play: async ({ canvasElement }) => {
    await expect(trigger(canvasElement)).toHaveAccessibleDescription(`${TITLE}. ${SUPPORTING}`);
  },
};
