import { tokens } from '@design-tokens/generated/tokens';

import { asTree, sortBySize } from './token-tree';
import { typographyClass } from './typography-classes';
import { type TypographyRole } from './TypographyTokens';

/** Semantic tags worth offering. The class sets appearance, never the element. */
export const playgroundElements = ['h1', 'h2', 'h3', 'p', 'span', 'label'] as const;

export type PlaygroundElement = (typeof playgroundElements)[number];

export type TypographyPlaygroundProps = {
  role: TypographyRole;
  size: string;
  text: string;
  element: PlaygroundElement;
};

/** The sizes a given role actually defines. Not every role carries every step. */
export function sizesForRole(role: TypographyRole): string[] {
  const sizes = asTree(asTree(tokens.typography)[role]);
  return sortBySize(Object.keys(sizes).map((name) => ({ name }))).map((entry) => entry.name);
}

export function TypographyPlayground({ role, size, text, element }: TypographyPlaygroundProps) {
  const className = typographyClass(role, size);
  const available = sizesForRole(role);
  const Tag = element;

  // Role and size are independent selects, so an invalid pairing is reachable. `label` has no
  // `2xl`, for instance. Saying which sizes the role does define teaches the scale rather than
  // silently rendering unstyled text.
  if (!className) {
    return (
      <main className="mx-auto grid max-w-3xl gap-(--abc-spacing-gap-lg) p-(--abc-spacing-inset-4xl)">
        <p className="text-body-md text-(--abc-feedback-error-text-primary)">
          <strong>{role}</strong> has no <strong>{size}</strong> step.
        </p>
        <p className="text-body-md text-(--abc-text-default-secondary)">
          Available sizes for {role}: {available.join(', ')}.
        </p>
      </main>
    );
  }

  const jsx = `<${element} className="${className}">${text}</${element}>`;
  const css = [
    `.my-element {`,
    `  font-family: var(--abc-text-${role}-${size}-family);`,
    `  font-weight: var(--abc-text-${role}-${size}-weight);`,
    `  font-size:   var(--abc-text-${role}-${size}-size);`,
    `  line-height: var(--abc-text-${role}-${size}-line);`,
    `}`,
  ].join('\n');

  return (
    <main className="mx-auto grid max-w-4xl gap-(--abc-spacing-gap-4xl) p-(--abc-spacing-inset-4xl) text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-sm)">
        <h1 className="text-heading-md font-semibold">Typography playground</h1>
        <p className="text-body-md text-(--abc-text-default-secondary)">
          Pick a role and size, edit the text, and copy the result. Switch the viewport toolbar to
          watch the same class resize at each breakpoint.
        </p>
      </header>

      <section
        aria-label="Preview"
        className="grid min-h-48 place-items-center rounded-(--abc-radius-lg) border border-(--abc-border-default-secondary) bg-(--abc-surface-default-primary) p-(--abc-spacing-inset-4xl)"
      >
        <Tag className={className}>{text}</Tag>
      </section>

      <div className="grid gap-(--abc-spacing-gap-xl)">
        <div className="grid gap-(--abc-spacing-gap-sm)">
          <h2 className="text-body-md font-semibold">In a component</h2>
          <pre
            tabIndex={0}
            className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-tertiary) p-(--abc-spacing-inset-2xl) text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <code>{jsx}</code>
          </pre>
          <p className="text-body-sm text-(--abc-text-default-tertiary)">
            The class sets size, line height, family and weight. It does not set the element. Choose
            the tag for document structure, then the class for appearance.
          </p>
        </div>

        <div className="grid gap-(--abc-spacing-gap-sm)">
          <h2 className="text-body-md font-semibold">In hand-written CSS</h2>
          <pre
            tabIndex={0}
            className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-tertiary) p-(--abc-spacing-inset-2xl) text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <code>{css}</code>
          </pre>
          <p className="text-body-sm text-(--abc-text-default-tertiary)">
            Prefer the utility class. Reach for the custom properties only where a class cannot go,
            inside a third-party component, or a rich-text block styled from a stylesheet.
          </p>
        </div>
      </div>
    </main>
  );
}
