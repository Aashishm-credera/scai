import { breakpoints } from '@design-tokens/generated/tokens';

import { TokenCode, TokenGrid, TokenPage, TokenSection } from './TokenLayout';

export function BreakpointTokens() {
  return (
    <TokenPage
      title="Breakpoints"
      lead="One set of thresholds drives the runtime values, the generated @media queries in semantic.css, and Tailwind's md:/lg:/xl: prefixes."
    >
      <TokenSection
        title="Thresholds"
        description="Each breakpoint is a minimum width. Responsive tokens switch discretely when one is crossed; they do not interpolate between the values on either side."
      >
        <TokenGrid minWidth="10rem">
          {Object.entries(breakpoints).map(([name, value]) => (
            <article
              className="grid gap-(--abc-spacing-gap-sm) rounded-(--abc-radius-md) border border-(--abc-border-default-secondary) bg-(--abc-surface-default-primary) p-(--abc-spacing-inset-2xl)"
              key={name}
            >
              <strong className="text-heading-xs">{name}</strong>
              <TokenCode>{`≥ ${value}`}</TokenCode>
            </article>
          ))}
        </TokenGrid>
      </TokenSection>
    </TokenPage>
  );
}
