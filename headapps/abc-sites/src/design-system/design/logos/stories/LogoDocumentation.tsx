const datasourceExample = `import type { Field } from '@sitecore-content-sdk/nextjs';
import { SitecoreLogo } from '@/design-system/design/logos';

type BrandProps = {
  fields?: {
    logo?: Field<string>;
    logoLabel?: Field<string>;
  };
};

export default function Brand({ fields }: BrandProps) {
  return (
    <SitecoreLogo
      name={fields?.logo?.value}
      alt={fields?.logoLabel?.value || undefined}
      size="md"
    />
  );
}`;

const accessibilityExample = `<abcLogo name="abc/wordmark" />

<abcLogo name="partner/charity-navigator" alt="" />`;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      tabIndex={0}
      className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-tertiary) p-(--abc-spacing-inset-lg) text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <code>{children}</code>
    </pre>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="grid gap-(--abc-spacing-gap-md)">
      <h2 className="text-heading-xs font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function LogoDocumentation() {
  return (
    <main className="mx-auto grid max-w-4xl gap-(--abc-spacing-gap-2xl) p-(--abc-spacing-inset-xl) text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-xs)">
        <p className="text-body-xs font-semibold uppercase text-(--abc-text-default-tertiary)">
          abc design system
        </p>
        <h1 className="text-heading-md font-semibold">Using logos</h1>
        <p className="max-w-3xl text-body-md text-(--abc-text-default-secondary)">
          The logo registry keeps approved artwork, proportions, responsive sizes, and CMS values in
          one place. Logos retain their approved brand palette; use Storybook&apos;s Light or Dark
          background control to check contrast.
        </p>
      </header>

      <Section title="Canonical values">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          Store a registry name from Gallery. Do not store SVG markup, a public URL, or a filename.
        </p>
        <CodeBlock>{`abc/wordmark
abc/symbol
abc/logomark
partner/charity-navigator`}</CodeBlock>
      </Section>

      <Section title="Sitecore rendering">
        <CodeBlock>{datasourceExample}</CodeBlock>
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          <code>SitecoreLogo</code> validates CMS input against the registry and uses the abc
          wordmark for missing, generic, and invalid abc values. Invalid <code>partner/*</code>{' '}
          values render nothing so a partner slot cannot display abc branding. Set{' '}
          <code>fallback={'{null}'}</code> to disable the generic fallback.
        </p>
      </Section>

      <Section title="Sizes and variants">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          Use <code>sm</code>, <code>md</code>, or <code>lg</code> for approved responsive
          dimensions. Partner logos may provide a <code>badge</code> variant for dark surfaces;
          logos without badge artwork safely use their default variant.
        </p>
      </Section>

      <Section title="Accessibility">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          Logos use their registered organization name by default. Pass an empty <code>alt</code>
          only when the same visible text already identifies the organization nearby. When CMS input
          falls back, the registered fallback name is used instead of a potentially stale CMS label.
        </p>
        <CodeBlock>{accessibilityExample}</CodeBlock>
      </Section>
    </main>
  );
}
