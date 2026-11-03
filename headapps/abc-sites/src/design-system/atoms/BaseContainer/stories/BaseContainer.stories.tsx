import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ReactNode } from 'react';
import { DemoBlock } from '#mocks/DemoBlock';
import { GridCanvas, GridOverlay, type GridOverlayProps } from '#mocks/GridCanvas';
import { BaseColumn } from '@/design-system/atoms/BaseColumn';
import { BaseContainer } from '@/design-system/atoms/BaseContainer';
import { BaseRow } from '@/design-system/atoms/BaseRow';

/**
 * Container centres content, caps it at 1280px and applies the page margin. All three values are
 * Figma tokens, so the interesting thing to check here is the **viewport toolbar**. Switch
 * between the presets and watch the hatched page margin (20 / 32 / 64 / 96px) and the content
 * width change, with no media query written in the component. From 1408px up the content stops
 * at 1280px and the grey canvas appears beside the margins.
 *
 * The red bars are the grid columns behind the content and the gaps between them are the
 * gutters. The readout above shows the live values.
 *
 * In Sitecore, the **Page Content Container** rendering puts its content in this. **Page Full
 * Width Container** does not, so its content runs edge to edge.
 */
const meta = {
  title: 'Atoms/Container',
  component: BaseContainer,
  parameters: { layout: 'fullscreen' },
  args: { children: <DemoBlock>Container content</DemoBlock> },
  render: ({ children, className }) => <GridCanvas className={className}>{children}</GridCanvas>,
} satisfies Meta<typeof BaseContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Nothing inside yet. The container should collapse quietly rather than reserve space. */
export const Empty: Story = {
  args: { children: undefined },
};

/** Several stacked children, to confirm the container does not impose spacing of its own. */
export const MultipleChildren: Story = {
  args: {
    children: [1, 2, 3].map((n) => <DemoBlock key={n}>Block {n}</DemoBlock>),
  },
};

/**
 * Classes passed in `className` merge with the container's own, so a component can add spacing
 * or a background without losing the cap and margins.
 */
export const WithAuthorStyles: Story = {
  args: { className: 'section-pad-lg theme-muted' },
};

function BandCopy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-(--abc-spacing-gap-sm)">
      <p className="text-heading-md font-bold">{title}</p>
      <p className="text-body-md">{children}</p>
    </div>
  );
}

/**
 * How a page is built in Sitecore, with the grid drawn over everything the way Figma overlays a
 * frame. Page Main Content holds two kinds of container:
 *
 * - **Page Content Container**: its background (from an author's Style) spans the page, and its
 *   content sits in this Container, on the columns.
 * - **Page Full Width Container**: no Container, so the content runs edge to edge through the
 *   hatched margins.
 *
 * Toggle `showGrid` to compare with the plain page.
 */
export const FullWidthAndContained: StoryObj<GridOverlayProps> = {
  args: { showGrid: true },
  argTypes: { showGrid: { control: 'boolean' } },
  render: ({ showGrid }) => (
    <GridOverlay showGrid={showGrid}>
      <section className="bg-(--abc-surface-brand-brand-1) py-(--abc-spacing-inset-4xl) text-(--abc-text-inverse-primary)">
        <BaseContainer>
          <BaseRow>
            <BaseColumn span={7}>
              <BandCopy title="Page Content Container, with a background">
                The background spans the page. The content sits in the Container, so it starts on
                the first column.
              </BandCopy>
            </BaseColumn>
          </BaseRow>
        </BaseContainer>
      </section>

      <BaseContainer className="py-(--abc-spacing-inset-4xl)">
        <BaseRow>
          <BaseColumn span={8}>
            <DemoBlock>Page Content Container, span 8</DemoBlock>
          </BaseColumn>
          <BaseColumn span={4}>
            <DemoBlock>Page Content Container, span 4</DemoBlock>
          </BaseColumn>
        </BaseRow>
      </BaseContainer>

      <div className="flex min-h-48 items-center justify-center bg-linear-[120deg,var(--abc-surface-default-tertiary),var(--abc-surface-default-secondary)] text-(--abc-text-default-primary)">
        <p className="rounded-(--abc-radius-md) bg-(--abc-surface-default-primary) px-(--abc-spacing-inset-md) py-(--abc-spacing-inset-sm) text-body-md">
          Page Full Width Container: edge to edge
        </p>
      </div>

      <BaseContainer className="py-(--abc-spacing-inset-4xl)">
        <BaseRow>
          {[1, 2, 3].map((n) => (
            <BaseColumn key={n} span={4}>
              <DemoBlock>Page Content Container, span 4</DemoBlock>
            </BaseColumn>
          ))}
        </BaseRow>
      </BaseContainer>

      <section className="bg-(--abc-surface-default-secondary) py-(--abc-spacing-inset-4xl) text-(--abc-text-default-primary)">
        <BaseContainer>
          <BandCopy title="Page Content Container, neutral background">
            Same container with a different background: the band is full width, its content stays on
            the grid.
          </BandCopy>
        </BaseContainer>
      </section>
    </GridOverlay>
  ),
};
