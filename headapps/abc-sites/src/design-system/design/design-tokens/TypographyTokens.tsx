import { breakpointTokens, breakpoints, tokens } from '@design-tokens/generated/tokens';

import { TokenPage, TokenSection } from './TokenLayout';
import { asTree, sortBySize } from './token-tree';
import { typographyClass } from './typography-classes';

const sampleText = 'Heart health starts with a strong foundation.';

export const typographyRoles = ['display', 'heading', 'body', 'label'] as const;

export type TypographyRole = (typeof typographyRoles)[number];

const breakpointOrder = ['sm', 'md', 'lg', 'xl'] as const;

/**
 * The runtime module groups sizes under `font.size.<group>`, and the group for the `body` role
 * is called `text`: a naming difference inherited from the Figma export. Everything else maps
 * straight across.
 */
const sizeGroupForRole: Readonly<Record<TypographyRole, string>> = {
  display: 'display',
  heading: 'heading',
  body: 'text',
  label: 'label',
};

/** What each role is actually for. The part a size table cannot tell you. */
const roleGuidance: Readonly<Record<TypographyRole, string>> = {
  display: 'Page and hero titles. One per screen, at most. Display type sets the entry point.',
  heading: 'Section and card titles. These carry the document outline, so pick by hierarchy.',
  body: 'Running copy and descriptions. The widest scale, because body text carries the most contexts.',
  label: 'UI chrome, buttons, form labels, table headers, badges. Short strings, never paragraphs.',
};

/**
 * The generator emits rem at a 16px root (REM_BASE_PX in generate.mjs). Showing px alongside is
 * presentational only. Components should still be written against the utility class, never a
 * pixel value, but "44px" is what a designer reads off a Figma inspector panel.
 */
const REM_BASE_PX = 16;

function toPx(value: string | undefined): string {
  if (!value) return ', ';
  const rem = value.match(/^(-?[\d.]+)rem$/);
  if (rem) {
    // Trim float noise from line-heights like 2.475rem without lopping off real precision.
    return `${Math.round(parseFloat(rem[1]) * REM_BASE_PX * 100) / 100}px`;
  }
  return value;
}

function lookup(
  bp: (typeof breakpointOrder)[number],
  kind: 'size' | 'line-height',
  role: TypographyRole,
  size: string
) {
  const font = asTree(asTree(breakpointTokens[bp]).font);
  const group = asTree(asTree(font[kind])[sizeGroupForRole[role]]);
  const value = group[size];
  return typeof value === 'string' ? value : undefined;
}

function Step({
  role,
  size,
  style,
  detail = true,
}: {
  role: TypographyRole;
  size: string;
  style: Record<string, unknown>;
  /** false trims the per-breakpoint table, for the at-a-glance overview on the Docs page. */
  detail?: boolean;
}) {
  const className = typographyClass(role, size);
  const fontWeight = Number(style.fontWeight ?? 400);
  const fontFamily = String(style.fontFamily ?? '');
  const hasSize = Boolean(style.fontSize);

  return (
    <article
      className={
        detail
          ? 'grid gap-[var(--abc-spacing-gap-lg)] border-b border-[var(--abc-border-default-secondary)] pb-[var(--abc-spacing-inset-4xl)]'
          : 'grid gap-[var(--abc-spacing-gap-xs)] border-b border-[var(--abc-border-default-secondary)] pb-[var(--abc-spacing-inset-lg)]'
      }
    >
      <p className={className}>{sampleText}</p>

      {detail ? (
        <div className="grid gap-(--abc-spacing-gap-sm)">
          {/* The class is the thing to copy, so it gets the weight and the primary text colour;
              everything below it is reference detail and stays quiet. */}
          <code className="text-body-md font-semibold text-(--abc-text-default-primary)">
            .{className}
          </code>
          <p className="text-body-sm text-(--abc-text-default-tertiary)">
            {fontFamily} · weight {fontWeight}
          </p>
        </div>
      ) : (
        <code className="text-body-sm font-semibold text-(--abc-text-default-tertiary)">
          .{className}
        </code>
      )}

      {detail && hasSize ? (
        <dl className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-(--abc-spacing-gap-md)">
          {breakpointOrder.map((bp) => {
            const fontSize = lookup(bp, 'size', role, size);
            const lineHeight = lookup(bp, 'line-height', role, size);
            return (
              <div
                className="grid gap-(--abc-spacing-gap-xs) rounded-(--abc-radius-sm) bg-(--abc-surface-default-primary) p-(--abc-spacing-inset-lg)"
                key={bp}
              >
                <dt className="text-body-xs font-semibold uppercase tracking-wide text-(--abc-text-default-tertiary)">
                  {bp} · ≥{breakpoints[bp]}
                </dt>
                <dd className="text-body-sm">
                  {toPx(fontSize)} / {toPx(lineHeight)}
                </dd>
                <dd className="text-body-xs text-(--abc-text-default-tertiary)">
                  {fontSize ?? ', '} / {lineHeight ?? ', '}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}

      {detail && !hasSize ? (
        <p className="text-body-sm text-(--abc-feedback-error-text-primary)">
          The Figma export carries no font-size for this role, so the utility inherits whatever size
          it lands in. Reported as `typography-missing-size` in design-tokens/reports/issues.md.
        </p>
      ) : null}
    </article>
  );
}

function stepsFor(role: TypographyRole) {
  const sizes = asTree(asTree(tokens.typography)[role]);
  // Sort the size keys themselves. Flattening first buries the key under `<size>.fontSize`,
  // which the scale order cannot see and which silently drops any size lacking a fontSize.
  return { sizes, steps: sortBySize(Object.keys(sizes).map((name) => ({ name }))) };
}

const roleLabel = (role: TypographyRole) => `${role[0].toUpperCase()}${role.slice(1)}`;

/**
 * One role per page. Splitting these out of a single combined page is deliberate: the body scale
 * alone fills a viewport, so a reader looking for one role used to scroll past the other three.
 *
 * `detail` is what lets the same component serve two jobs on the Docs page. The block at the top
 * runs with `detail={false}` and is driven by the role control, so a reader picks a scale and
 * sees just that one stacked. The role stories below run with the default, carrying the full
 * per-breakpoint tables.
 */
export function TypographyTokens({
  role,
  detail = true,
}: {
  role: TypographyRole;
  detail?: boolean;
}) {
  const { sizes, steps } = stepsFor(role);
  const label = roleLabel(role);

  return (
    <TokenPage title={label} lead={roleGuidance[role]}>
      <TokenSection
        title={`${label} scale`}
        description={
          detail
            ? "Each sample renders the real utility class named beneath it, so switching the viewport toolbar resizes it exactly as a component would. Every breakpoint's computed size and line height is listed, in px for reading and rem for what actually ships."
            : 'Every step in this scale, at the size it renders right now. Open the role below for the per-breakpoint values.'
        }
      >
        <div
          className={
            detail ? 'grid gap-[var(--abc-spacing-gap-xl)]' : 'grid gap-[var(--abc-spacing-gap-md)]'
          }
        >
          {steps.map(({ name: size }) => (
            <Step detail={detail} key={size} role={role} size={size} style={asTree(sizes[size])} />
          ))}
        </div>
      </TokenSection>
    </TokenPage>
  );
}
