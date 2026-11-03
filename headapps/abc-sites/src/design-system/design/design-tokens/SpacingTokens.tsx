import { cssVariables, tokens } from '@design-tokens/generated/tokens';

import { TokenCode, TokenGroup, TokenPage, TokenSection } from './TokenLayout';
import { leafName, sortBySize, tokenEntries, type TokenEntry } from './token-tree';

const scales = [
  [
    'Gap',
    'Space between siblings, grid and flex gaps',
    cssVariables.spacing?.gap,
    tokens.spacing.gap,
  ],
  [
    'Inset',
    'Space inside a container, padding on cards, buttons and sections',
    cssVariables.spacing?.inset,
    tokens.spacing.inset,
  ],
] as const;

function ScaleBars({ entries }: { entries: TokenEntry[] }) {
  return (
    <div className="grid gap-(--abc-spacing-gap-sm) rounded-(--abc-radius-lg) border border-(--abc-border-default-secondary) bg-(--abc-surface-default-primary) p-(--abc-spacing-inset-2xl)">
      {entries.map((entry) => (
        <div
          className="grid grid-cols-[5rem_minmax(0,1fr)_5rem] items-center gap-(--abc-spacing-gap-md)"
          key={entry.name}
        >
          <strong className="text-body-sm">{leafName(entry.name)}</strong>
          <div className="h-3 overflow-hidden rounded-(--abc-radius-pill) bg-(--abc-surface-default-secondary)">
            {/* max-width caps the bar rather than min(), which rejects the unitless 0
                behind the `none` step and silently falls back to a full-width bar. */}
            <div
              className="h-full min-w-px rounded-(--abc-radius-pill) bg-(--abc-surface-brand-brand-1)"
              style={{ width: `var(${entry.variable})`, maxWidth: '100%' }}
            />
          </div>
          <TokenCode>{entry.value}</TokenCode>
        </div>
      ))}
    </div>
  );
}

export function SpacingTokens() {
  return (
    <TokenPage
      title="Spacing"
      lead="Two semantic scales, gap between elements and inset within them. Both are responsive: the values switch discretely at the configured breakpoints, they do not interpolate."
    >
      <TokenSection
        title="Semantic scales"
        description="The bars render the live custom property, so resizing the Storybook viewport moves them at each breakpoint. The number on the right is the sm (base) value."
      >
        <div className="grid gap-(--abc-spacing-gap-xl)">
          {scales.map(([title, description, cssTree, valueTree]) => (
            <TokenGroup key={title} title={title}>
              <p className="text-body-sm text-(--abc-text-default-secondary)">{description}</p>
              <ScaleBars entries={sortBySize(tokenEntries(cssTree, valueTree))} />
            </TokenGroup>
          ))}
        </div>
      </TokenSection>
    </TokenPage>
  );
}
