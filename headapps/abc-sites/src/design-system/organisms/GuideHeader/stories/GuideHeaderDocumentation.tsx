import type { ReactNode } from 'react';

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-(--abc-spacing-inset-lg) text-body-sm">
      <code>{children}</code>
    </pre>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-(--abc-spacing-gap-md)">
      <h2 className="text-heading-sm">{title}</h2>
      {children}
    </section>
  );
}

export function GuideHeaderDocumentation() {
  return (
    <main className="mx-auto grid max-w-4xl gap-(--abc-spacing-gap-2xl) p-(--abc-spacing-inset-xl) text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-xs)">
        <p className="text-body-xs uppercase tracking-wide text-(--abc-text-default-tertiary)">
          abc design system
        </p>
        <h1 className="text-heading-md">Guide Header usage</h1>
        <p className="text-body-md text-(--abc-text-default-secondary)">
          Guide Header is a presentation component. Its image, title, description, and status icon
          are React-node slots; the rendering adapter is responsible for producing them.
        </p>
      </header>

      <Section title="Content slots">
        <ul className="list-disc space-y-2 pl-(--abc-spacing-inset-xl) text-body-sm text-(--abc-text-default-secondary)">
          <li>The title slot is rendered inside the page H1.</li>
          <li>The description slot supports rich content without imposing a paragraph wrapper.</li>
          <li>The image slot is composed into a crop-safe parallax backdrop.</li>
          <li>Pass the localized updated label with the status date to avoid a built-in language.</li>
        </ul>
        <CodeBlock>{`<GuideHeader
  title={<span>Guide title</span>}
  description={<p>Guide introduction</p>}
  image={<ParallaxBackdrop image={<img src="/guide.jpg" alt="" />} />}
  updatedLabel={localizedUpdatedLabel}
/>`}</CodeBlock>
      </Section>

      <Section title="Image and motion">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          The ParallaxBackdrop atom composes the existing BaseImage atom, keeps 12vh crop-safe bleed
          above and below the viewport, and respects reduced-motion preferences. Its image is a
          caller-provided slot.
        </p>
      </Section>

      <Section title="Accessibility">
        <ul className="list-disc space-y-2 pl-(--abc-spacing-inset-xl) text-body-sm text-(--abc-text-default-secondary)">
          <li>The section is labelled by its H1 when a title is supplied.</li>
          <li>Write meaningful image alternative text, or use an empty string for a decorative image.</li>
          <li>Long titles, descriptions, and status text wrap rather than hiding overflow.</li>
          <li>BaseBreadcrumb owns breadcrumb links, responsive collapse, and accessibility.</li>
        </ul>
      </Section>
    </main>
  );
}
