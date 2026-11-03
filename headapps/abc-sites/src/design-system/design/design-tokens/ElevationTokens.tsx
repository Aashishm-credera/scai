import { tokens } from '@design-tokens/generated/tokens';

import { TokenCode, TokenGrid, TokenPage, TokenSection } from './TokenLayout';
import { asTree, flattenLeaves } from './token-tree';

export function ElevationTokens() {
  const shadows = flattenLeaves(asTree(tokens.shadow));
  const isFocusRing = (name: string) => name.startsWith('focus-ring');

  const groups = [
    [
      'Elevation',
      'Layering depth for cards, menus and modals. Larger roles read as further from the page.',
      shadows.filter((entry) => !isFocusRing(entry.name)),
    ],
    [
      'Focus rings',
      'Keyboard focus indicators. Apply these rather than hand-rolling an outline, so focus stays consistent and visible against every surface.',
      shadows.filter((entry) => isFocusRing(entry.name)),
    ],
  ] as const;

  return (
    <TokenPage
      title="Elevation"
      lead="Composed box-shadow presets generated from the individual Figma effect values, plus the focus rings built from the same primitives."
    >
      {groups.map(([title, description, entries]) => (
        <TokenSection description={description} key={title} title={title}>
          <TokenGrid minWidth="12rem">
            {entries.map((entry) => (
              <article
                className="grid min-h-32 place-items-center rounded-(--abc-radius-lg) bg-(--abc-surface-default-primary) p-(--abc-spacing-inset-2xl) text-center"
                key={entry.name}
                style={{ boxShadow: entry.value }}
              >
                <div className="grid gap-(--abc-spacing-gap-sm)">
                  <strong className="text-body-sm">{entry.name}</strong>
                  <TokenCode>{entry.value}</TokenCode>
                </div>
              </article>
            ))}
          </TokenGrid>
        </TokenSection>
      ))}
    </TokenPage>
  );
}
