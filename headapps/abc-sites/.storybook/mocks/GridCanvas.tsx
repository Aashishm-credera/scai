'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { breakpoints } from '@design-tokens/generated/tokens';
import { BaseContainer } from '@/design-system/atoms/BaseContainer';
import { BaseRow } from '@/design-system/atoms/BaseRow';
import { cn } from '@/design-system/lib/cn';

/**
 * Storybook's version of Figma's Shift + G: the page margin hatched, the column bars behind the
 * content, and a readout of the live values. The guides are drawn with the real BaseContainer and
 * BaseRow, so they show what the browser actually lays out, never a second copy of the numbers.
 */

const MODES = [
  { name: 'XL · Large desktop', min: breakpoints.xl },
  { name: 'L · Desktop', min: breakpoints.lg },
  { name: 'M · Tablet', min: breakpoints.md },
  { name: 'S · Mobile', min: breakpoints.sm },
];

const MARGIN_HATCH: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(-45deg, color-mix(in srgb, var(--abc-surface-brand-brand-1) 35%, transparent) 0 1px, transparent 1px 7px)',
  backgroundColor: 'color-mix(in srgb, var(--abc-surface-brand-brand-1) 6%, transparent)',
};

const COLUMN_FILL = 'bg-(--abc-surface-brand-brand-1)/15';

type GridMetrics = {
  mode: string;
  viewport: number;
  columns: number;
  margin: number;
  gutter: number;
  content: number;
};

function useGridMetrics(
  container: RefObject<HTMLDivElement | null>,
  row: RefObject<HTMLDivElement | null>
) {
  const [metrics, setMetrics] = useState<GridMetrics>();

  useEffect(() => {
    const containerEl = container.current;
    const rowEl = row.current;
    if (!containerEl || !rowEl) return;

    const measure = () => {
      const viewport = document.documentElement.clientWidth;
      const margin = parseFloat(getComputedStyle(containerEl).paddingInlineStart);
      const grid = getComputedStyle(rowEl);
      setMetrics({
        mode: MODES.find(({ min }) => viewport >= parseFloat(min))?.name ?? '',
        viewport,
        columns: grid.gridTemplateColumns.split(' ').length,
        margin,
        gutter: parseFloat(grid.columnGap),
        content: containerEl.clientWidth - 2 * margin,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(containerEl);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [container, row]);

  return metrics;
}

function Swatch({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-3 rounded-(--abc-radius-2xs) align-middle', className)}
      style={style}
    />
  );
}

function GridReadout({ metrics }: { metrics?: GridMetrics }) {
  if (!metrics) return null;

  const values = [
    `${metrics.viewport}px viewport`,
    `${metrics.columns} columns`,
    `${metrics.margin}px margin`,
    `${metrics.gutter}px gutter`,
    `${Math.round(metrics.content)}px content`,
  ];

  return (
    <BaseContainer className="mb-(--abc-spacing-gap-md)">
      <div className="flex flex-wrap items-center gap-x-(--abc-spacing-gap-lg) gap-y-(--abc-spacing-gap-xs) rounded-(--abc-radius-md) bg-(--abc-surface-default-primary) px-(--abc-spacing-inset-md) py-(--abc-spacing-inset-sm) text-body-sm text-(--abc-text-default-primary)">
        <strong className="font-bold">{metrics.mode}</strong>
        {values.map((value) => (
          <span key={value} className="text-(--abc-text-default-secondary)">
            {value}
          </span>
        ))}
        <span className="flex flex-wrap items-center gap-x-(--abc-spacing-gap-md) text-(--abc-text-default-secondary)">
          <span>
            <Swatch style={MARGIN_HATCH} /> Margin
          </span>
          <span>
            <Swatch className={COLUMN_FILL} /> Column
          </span>
          <span>
            <Swatch className="border border-(--abc-border-default-secondary) bg-(--abc-surface-default-primary)" />{' '}
            Gutter
          </span>
        </span>
      </div>
    </BaseContainer>
  );
}

/** Margin bands sit in the container's padding, so they are exactly as wide as the token. */
function MarginBand({ side }: { side: 'start' | 'end' }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-y-0 w-(--abc-layout-container-page-margin-inline)',
        side === 'start' ? 'start-0' : 'end-0'
      )}
      style={MARGIN_HATCH}
    />
  );
}

/** Six bars below 480px and twelve above, drawn with the real BaseRow so they match any Row. */
function ColumnBars({ ref }: { ref: RefObject<HTMLDivElement | null> }) {
  return (
    <BaseRow ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className={cn(COLUMN_FILL, index >= 6 && 'hidden md:block')} />
      ))}
    </BaseRow>
  );
}

export type GridCanvasProps = {
  children?: ReactNode;
  /** Passed to the container, for stories that add classes to it. */
  className?: string;
};

export function GridCanvas({ children, className }: GridCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const metrics = useGridMetrics(container, row);

  return (
    <div className="bg-(--abc-surface-default-tertiary) py-(--abc-spacing-inset-xl)">
      <GridReadout metrics={metrics} />
      <BaseContainer
        ref={container}
        className={cn('relative bg-(--abc-surface-default-primary)', className)}
      >
        <MarginBand side="start" />
        <MarginBand side="end" />
        {/* Space above and below the content lets every bar show, even behind a full-width block.
            An empty story gets none, so it still shows the container collapsing. */}
        <div className={cn('relative', children && 'py-(--abc-spacing-inset-2xl)')}>
          <ColumnBars ref={row} />
          <div className="relative">{children}</div>
        </div>
      </BaseContainer>
    </div>
  );
}

export type GridOverlayProps = {
  children?: ReactNode;
  /** Hides the guides without changing the layout, to compare against the plain page. */
  showGrid?: boolean;
};

/**
 * For stories that compose a page: the guides are drawn over the whole section, the way Figma
 * overlays a frame, so a full-width band can be seen reaching into the margins while the content
 * inside it still lands on the columns.
 */
export function GridOverlay({ children, showGrid = true }: GridOverlayProps) {
  const container = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const metrics = useGridMetrics(container, row);

  return (
    <div className="bg-(--abc-surface-default-primary) pt-(--abc-spacing-inset-xl)">
      <GridReadout metrics={metrics} />
      <div className="relative">
        {children}
        {/* Absolute with both insets at 0, the container's max-width and auto margins still centre
            it, so the guides sit exactly where a real BaseContainer would. Multiply keeps the red
            guides visible over a red band, where a plain tint would vanish. */}
        <BaseContainer
          ref={container}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 z-10 mix-blend-multiply',
            !showGrid && 'invisible'
          )}
        >
          <MarginBand side="start" />
          <MarginBand side="end" />
          <div className="relative h-full">
            <ColumnBars ref={row} />
          </div>
        </BaseContainer>
      </div>
    </div>
  );
}
