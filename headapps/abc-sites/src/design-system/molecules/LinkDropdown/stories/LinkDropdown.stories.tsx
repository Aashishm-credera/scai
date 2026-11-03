import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LinkDropdown, type LinkDropdownItem } from '@/design-system/molecules/LinkDropdown';
import { LinkDropdownDocumentation } from './LinkDropdownDocumentation';
import { LinkDropdownGallery } from './LinkDropdownGallery';
import { verifyLinkDropdownGallery } from './LinkDropdownGalleryInteraction';
import {
  LinkDropdownPlayground,
  linkDropdownPlaygroundArgTypes,
  type LinkDropdownPlaygroundProps,
} from './LinkDropdownPlayground';
import { LinkDropdownPositioning } from './LinkDropdownPositioning';

const meta = {
  title: 'Molecules/Link Dropdown',
  component: LinkDropdown,
  args: {
    items: [],
    triggerLabel: 'Show hidden breadcrumb pages',
  },
  parameters: {
    controls: { disable: true },
    a11y: {
      // Scan both the trigger and portal while omitting Base UI's intentional focus sentinels.
      context: {
        include: ['body'],
        exclude: [
          '[data-base-ui-focus-guard]',
          '[data-slot="button-label"] > [aria-hidden="true"]',
        ],
      },
      // Behavior below verifies the popup referenced by aria-controls is mounted.
      config: {
        checks: [{ id: 'aria-valid-attr-value', options: ['aria-controls'] }],
      },
    },
    docs: {
      description: {
        component:
          'A Figma-aligned breadcrumb overflow control that reveals native navigation links in a non-modal Base UI popover.',
      },
    },
  },
} satisfies Meta<typeof LinkDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

function findPopup(body: ReturnType<typeof within>, name: string) {
  return body.queryByRole('dialog', { name });
}

async function expectPopupClosed(
  body: ReturnType<typeof within>,
  name: string,
  trigger: HTMLElement
) {
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  await waitFor(() => expect(findPopup(body, name)).not.toBeInTheDocument(), { timeout: 3000 });
}

export const Gallery: Story = {
  render: () => <LinkDropdownGallery />,
  play: ({ canvasElement }) => verifyLinkDropdownGallery(canvasElement),
};

export const Documentation: Story = {
  render: () => <LinkDropdownDocumentation />,
};

export const Playground: StoryObj<LinkDropdownPlaygroundProps> = {
  args: {
    defaultOpen: false,
    itemCount: 1,
    longLabel: false,
    navigationLabel: 'Hidden breadcrumb pages',
    triggerLabel: 'Show hidden breadcrumb pages',
  },
  argTypes: linkDropdownPlaygroundArgTypes,
  parameters: { controls: { disable: false } },
  render: (args) => <LinkDropdownPlayground {...args} />,
  play: async ({ args, canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: args.triggerLabel });
    await expect(trigger).toHaveAttribute('type', 'button');
    await expect(trigger).toHaveAccessibleName(args.triggerLabel);
    await expect(trigger).toHaveAttribute('aria-expanded', String(args.defaultOpen));

    if (args.defaultOpen) {
      const body = within(canvasElement.ownerDocument.body);
      const navigation = within(
        await body.findByRole('navigation', { name: args.navigationLabel })
      );
      await expect(navigation.getAllByRole('link')).toHaveLength(args.itemCount);
    }
  },
};

type BehaviorHarnessProps = {
  onNavigate?: () => void;
};

function BehaviorHarness({ onNavigate }: BehaviorHarnessProps) {
  const items = [
    {
      id: 'heart-health',
      label: 'Heart health',
      link: (
        <a href="#heart-health" onClick={onNavigate}>
          Provider placeholder
        </a>
      ),
    },
    {
      id: 'healthy-living',
      label: 'Healthy living',
      link: <a href="#healthy-living">Provider placeholder</a>,
    },
  ] satisfies readonly LinkDropdownItem[];

  return (
    <main
      className="grid min-h-96 place-items-center bg-(--abc-surface-default-primary) p-(--abc-spacing-inset-xl)"
      onClickCapture={(event) => {
        if ((event.target as Element).closest('a')) event.preventDefault();
      }}
    >
      <LinkDropdown
        items={items}
        navigationLabel="Behavior hidden breadcrumb pages"
        triggerLabel="Show hidden breadcrumb pages"
      />
      <button type="button">Continue after breadcrumb</button>
    </main>
  );
}

export const Behavior: StoryObj<BehaviorHarnessProps> = {
  tags: ['!dev'],
  args: { onNavigate: fn() },
  render: (args) => <BehaviorHarness {...args} />,
  play: async ({ args, canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const name = 'Behavior hidden breadcrumb pages';
    const trigger = canvas.getByRole('button', { name: 'Show hidden breadcrumb pages' });
    const outside = canvas.getByRole('button', { name: 'Continue after breadcrumb' });

    await expect(trigger).toHaveAttribute('type', 'button');
    await expect(trigger).toHaveClass('link-dropdown-trigger');
    await expect(trigger.parentElement).toHaveClass('link-dropdown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(
      getComputedStyle(trigger)
        .getPropertyValue('--abc-surface-brand-brand-1-secondary-hover')
        .trim()
    ).toBe('#9c0a11');
    await userEvent.hover(trigger);
    await body.findByRole('dialog', { name });
    await userEvent.unhover(trigger);
    await expectPopupClosed(body, name, trigger);

    await userEvent.click(trigger);
    const firstPopup = await body.findByRole('dialog', { name });
    await expect(firstPopup).toHaveClass('link-dropdown-popup');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls', firstPopup.id);
    await expect(firstPopup).toHaveAttribute('data-open');
    await expect(firstPopup).toHaveAttribute('data-side', 'bottom');
    await expect(firstPopup).toHaveAttribute('data-align', 'start');
    await new Promise((resolve) => setTimeout(resolve, 550));
    await userEvent.click(trigger);
    await waitFor(() => expect(firstPopup).toHaveAttribute('data-ending-style'));
    await expectPopupClosed(body, name, trigger);
    await userEvent.click(trigger);
    await userEvent.click(outside);
    await expectPopupClosed(body, name, trigger);

    outside.focus();
    await userEvent.tab({ shift: true });
    await expect(trigger).toHaveFocus();
    const navigation = within(await body.findByRole('navigation', { name }));
    const links = navigation.getAllByRole('link');
    await expect(links.map((link) => link.textContent)).toEqual(['Heart health', 'Healthy living']);
    await expect(links.every((link) => link.classList.contains('link-dropdown-item'))).toBe(true);
    await userEvent.tab();
    await expect(links[0]).toHaveFocus();
    await expect(getComputedStyle(links[0]).outlineStyle).toBe('solid');
    await waitFor(() => expect(getComputedStyle(links[0]).outlineColor).toBe('rgb(207, 34, 43)'));
    await userEvent.tab();
    await expect(links[1]).toHaveFocus();
    await userEvent.tab();
    await expect(outside).toHaveFocus();
    await expectPopupClosed(body, name, trigger);

    await userEvent.tab({ shift: true });
    await expect(trigger).toHaveFocus();
    await body.findByRole('navigation', { name });
    await userEvent.tab();
    await userEvent.keyboard('{Escape}');
    await expectPopupClosed(body, name, trigger);
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await body.findByRole('dialog', { name });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(args.onNavigate).toHaveBeenCalledOnce();
    await expectPopupClosed(body, name, trigger);
  },
};

export const Positioning: Story = {
  tags: ['!dev'],
  parameters: {
    viewport: {
      defaultViewport: 'reflow-320',
      options: {
        'reflow-320': {
          name: 'Reflow, 320px',
          styles: { width: '320px', height: '700px' },
        },
      },
    },
  },
  render: () => <LinkDropdownPositioning />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popups = await body.findAllByRole('dialog');
    const viewportWidth = canvasElement.ownerDocument.documentElement.clientWidth;

    for (const popup of popups) {
      await waitFor(() => {
        const bounds = popup.getBoundingClientRect();
        expect(bounds.left).toBeGreaterThanOrEqual(7.5);
        expect(bounds.right).toBeLessThanOrEqual(viewportWidth - 7.5);
      });
    }

    const flipNavigation = await body.findByRole('navigation', { name: 'Flip above links' });
    await waitFor(() =>
      expect(flipNavigation.closest('[data-side]')).toHaveAttribute('data-side', 'top')
    );

    const longNavigation = within(
      await body.findByRole('navigation', { name: 'Long label links' })
    );
    const longLink = longNavigation.getByRole('link');
    await expect(getComputedStyle(longLink).whiteSpace).toBe('nowrap');
    await expect(getComputedStyle(longLink).textOverflow).not.toBe('ellipsis');
    await expect(longLink.closest('[role="dialog"]')).toHaveClass('link-dropdown-popup');
  },
};
