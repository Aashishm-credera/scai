import { cssVariables, tokens } from '@design-tokens/generated/tokens';

import { TokenCode, TokenGrid, TokenGroup, TokenPage, TokenSection } from './TokenLayout';
import { asTree, sortBySize, tokenEntries, type TokenEntry } from './token-tree';

/**
 * Ramps are read out of the generated module rather than listed by hand, so adding a shade
 * in Figma surfaces here on the next `tokens:build` instead of silently going undocumented.
 */
const ramps = [
  ...Object.keys(asTree(tokens.color.brand)).map(
    (name) =>
      [`Brand ${name}`, `color.brand.${name}`, asTree(asTree(tokens.color.brand)[name])] as const
  ),
  ['Neutral', 'color.neutral', asTree(tokens.color.neutral)] as const,
];

const semanticGroups = [
  [
    'Surface',
    'Backgrounds, page, cards, buttons, brand-colored blocks',
    cssVariables.surface,
    tokens.surface,
  ],
  [
    'Text',
    'Body copy, headings, links, placeholder and inverse text',
    cssVariables.text,
    tokens.text,
  ],
  ['Border', 'Dividers, input outlines and focus rings', cssVariables.border, tokens.border],
  [
    'Foreground',
    'Icons and other non-text foreground content',
    cssVariables.foreground,
    tokens.foreground,
  ],
  ['Feedback', 'Error, warning and success states', cssVariables.feedback, tokens.feedback],
  [
    'Accent',
    'Categorical colors for tags, charts and illustrative blocks',
    cssVariables.accent,
    tokens.accent,
  ],
] as const;

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div
      aria-label={`${label} swatch`}
      className="h-20 border-b border-(--abc-border-default-secondary)"
      role="img"
      style={{ background: color }}
    />
  );
}

function SwatchCard({ entry }: { entry: TokenEntry }) {
  return (
    <article className="overflow-hidden rounded-(--abc-radius-md) border border-(--abc-border-default-secondary) bg-(--abc-surface-default-primary)">
      <Swatch color={`var(${entry.variable})`} label={entry.name} />
      <div className="grid gap-(--abc-spacing-gap-sm) p-(--abc-spacing-inset-xl)">
        <strong className="text-body-sm">{entry.name}</strong>
        <TokenCode>{entry.variable}</TokenCode>
        {entry.value ? <TokenCode>{entry.value}</TokenCode> : null}
      </div>
    </article>
  );
}

function Ramp({
  title,
  path,
  shades,
}: {
  title: string;
  path: string;
  shades: Record<string, unknown>;
}) {
  const steps = sortBySize(
    Object.entries(shades)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([name, value]) => ({ name, value }))
  );

  return (
    <TokenGroup title={title}>
      <TokenCode>{`--abc-${path.replaceAll('.', '-')}-{${steps.at(0)?.name} … ${steps.at(-1)?.name}}`}</TokenCode>
      {/* auto-fill, not auto-fit: a single-shade ramp like brand-highlight would otherwise
          stretch one swatch across the full row and read as a banner rather than a scale. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-(--abc-spacing-gap-sm)">
        {steps.map((step) => (
          <div className="grid gap-(--abc-spacing-gap-sm)" key={step.name}>
            <div
              aria-label={`${title} ${step.name} swatch`}
              className="h-16 rounded-(--abc-radius-sm) border border-(--abc-border-default-secondary)"
              role="img"
              style={{ background: step.value }}
            />
            <strong className="text-body-sm">{step.name}</strong>
            <TokenCode>{step.value}</TokenCode>
          </div>
        ))}
      </div>
    </TokenGroup>
  );
}

export const colorLayers = ['primitives', 'semantic'] as const;

export type ColorLayer = (typeof colorLayers)[number];

/**
 * One layer per page. The two pages answer different questions: "what reds exist" and "what do
 * I write in a className". A reader almost always wants one of them, not both. Storybook's Docs
 * entry stacks the stories, so the combined view is still available.
 */
export function ColorTokens({ layer }: { layer: ColorLayer }) {
  if (layer === 'primitives') {
    return (
      <TokenPage
        title="Primitive ramps"
        lead="The raw scales, straight from Figma. Do not use these in components. Reach for the semantic token that names the purpose instead, so a palette change stays a one-line edit in Figma."
      >
        <TokenSection
          title="Brand and neutral scales"
          description="Read live from the generated tokens, so a shade added in Figma shows up here on the next build instead of going undocumented."
        >
          <div className="grid gap-(--abc-spacing-gap-xl)">
            {ramps.map(([title, path, shades]) => (
              <Ramp key={path} path={path} shades={shades} title={title} />
            ))}
          </div>
        </TokenSection>
      </TokenPage>
    );
  }

  return (
    <TokenPage
      title="Semantic roles"
      lead="What a className should reference, directly or through the bg-abc-* and text-abc-* aliases. Naming the purpose rather than the value is what lets a rebrand stay a Figma edit."
    >
      {semanticGroups.map(([groupName, description, cssTree, valueTree]) => (
        <TokenSection description={description} key={groupName} title={groupName}>
          <TokenGrid minWidth="13rem">
            {tokenEntries(cssTree, valueTree).map((entry) => (
              <SwatchCard entry={entry} key={entry.name} />
            ))}
          </TokenGrid>
        </TokenSection>
      ))}
    </TokenPage>
  );
}
