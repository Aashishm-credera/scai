import { cssVariables, tokens } from '@design-tokens/generated/tokens';

import { TokenCode, TokenGrid, TokenPage, TokenSection } from './TokenLayout';
import { sortBySize, tokenEntries } from './token-tree';

/**
 * The radius group also carries the raw pixel aliases it was built from (`radius.8`,
 * `radius.9999`); components use the named roles, so only those are documented.
 */
const namedRoles = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'pill'];

export function RadiusTokens() {
  const entries = sortBySize(
    tokenEntries(cssVariables.radius, tokens.radius).filter((entry) =>
      namedRoles.includes(entry.name)
    )
  );

  return (
    <TokenPage
      title="Radius"
      lead="Corner rounding roles, shown on the same surface and border tokens components use."
    >
      <TokenSection
        title="Corner radii"
        description="Pick the role by intent, sm for inputs and chips, md/lg for cards and panels, pill for fully rounded controls."
      >
        <TokenGrid minWidth="9rem">
          {entries.map((entry) => (
            <article className="grid gap-(--abc-spacing-gap-sm) text-center" key={entry.name}>
              <div
                className="h-24 border-2 border-(--abc-border-brand-primary) bg-(--abc-surface-brand-brand-1-secondary)"
                style={{ borderRadius: `var(${entry.variable})` }}
              />
              <strong className="text-body-sm">{entry.name}</strong>
              <TokenCode>{entry.variable}</TokenCode>
              {entry.value ? <TokenCode>{entry.value}</TokenCode> : null}
            </article>
          ))}
        </TokenGrid>
      </TokenSection>
    </TokenPage>
  );
}
