import type { ReactNode } from 'react';

/**
 * Page chrome shared by every Design page, so Colors and Spacing cannot drift into
 * looking like two different design systems. Each page renders exactly one TokenPage.
 *
 * On the spacing choices here: the semantic gap scale runs to 12xl (128px), but the roles a
 * product UI reaches for most. Lg, xl, 2xl. Top out around 19px, because they are sized for
 * space *inside* a component. These are documentation pages: long-form reading at desktop
 * width, where that rhythm reads as cramped. So the page-level structure deliberately uses the
 * upper half of the same scale (9xl / 6xl / 3xl) rather than inventing values outside it.
 */
export function TokenPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-(--abc-surface-default-secondary) text-(--abc-text-default-primary)">
      <div className="mx-auto grid max-w-(--abc-layout-container-max-width) gap-(--abc-spacing-gap-9xl) px-(--abc-layout-container-page-margin-inline) py-(--abc-spacing-inset-6xl)">
        <header className="grid max-w-3xl gap-(--abc-spacing-gap-md)">
          <p className="text-body-sm font-semibold uppercase tracking-wide text-(--abc-text-default-tertiary)">
            abc design system
          </p>
          <h1 className="text-display-md">{title}</h1>
          <p className="text-body-lg text-(--abc-text-default-secondary)">{lead}</p>
        </header>
        {children}
      </div>
    </main>
  );
}

export function TokenSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-(--abc-spacing-gap-6xl)">
      <header className="grid max-w-3xl gap-(--abc-spacing-gap-sm) border-t border-(--abc-border-default-secondary) pt-(--abc-spacing-inset-2xl)">
        <h2 className="text-heading-lg font-semibold">{title}</h2>
        <p className="text-body-md text-(--abc-text-default-secondary)">{description}</p>
      </header>
      {children}
    </section>
  );
}

export function TokenGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-(--abc-spacing-gap-2xl)">
      <h3 className="text-heading-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function TokenCode({ children }: { children: string }) {
  return (
    <code className="break-all text-body-sm text-(--abc-text-default-tertiary)">{children}</code>
  );
}

export function TokenGrid({ minWidth, children }: { minWidth: string; children: ReactNode }) {
  return (
    <div
      className="grid gap-(--abc-spacing-gap-2xl)"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))` }}
    >
      {children}
    </div>
  );
}
