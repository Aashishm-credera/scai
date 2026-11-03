const datasourceExample = `import type { Field } from '@sitecore-content-sdk/nextjs';
import { SitecoreIcon } from '@/design-system/design/icons';
import type { ComponentProps } from '@/lib/component-props';

type IconCardProps = ComponentProps & {
  fields?: {
    icon?: Field<string>;
    iconLabel?: Field<string>;
  };
};

export default function IconCard({ fields }: IconCardProps) {
  const label = fields?.iconLabel?.value?.trim();

  return (
    <SitecoreIcon
      name={fields?.icon?.value}
      size="lg"
      color="brand-primary"
      aria-hidden={label ? undefined : true}
      aria-label={label || undefined}
    />
  );
}`;

const accessibilityExample = `<abcIcon name="interface/general/check" aria-hidden />

<abcIcon name="interface/alerts-feedback/alert-triangle" aria-label="Warning" />

<button type="button" aria-label="Search">
  <abcIcon name="interface/general/search-lg" aria-hidden />
</button>`;

const updateCommands = `npm run icons:build
npm run icons:check
git diff --name-status -- design-tokens/icons public/icons src/design-system/design/icons
npm run lint
npm test
npm run build-storybook
npm run build`;

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

export function IconDocumentation() {
  return (
    <main className="mx-auto grid max-w-4xl gap-(--abc-spacing-gap-2xl) p-(--abc-spacing-inset-xl) text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-xs)">
        <p className="text-body-xs font-semibold uppercase tracking-wide text-(--abc-text-default-tertiary)">
          abc design system
        </p>
        <h1 className="text-heading-md font-semibold">Using icons</h1>
        <p className="max-w-3xl text-body-md text-(--abc-text-default-secondary)">
          Sitecore stores an approved registry name. The application validates that value and
          renders the same sanitized SVG assets used by Storybook.
        </p>
      </header>

      <Section title="Canonical values">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          Copy an exact name from Gallery. Store the registry name only, never SVG markup, a Figma
          node ID, a public URL, or a filename. Interface names follow{' '}
          <code>interface/&lt;subcategory&gt;/&lt;icon-name&gt;</code>. Pictoral stroke variants use{' '}
          <code>pictoral/&lt;icon-name&gt;</code>.
        </p>
        <CodeBlock>{`interface/general/search-lg
pictoral/cpr
miscellaneous/payment/visa
miscellaneous/social/facebook
miscellaneous/social/facebook-gray`}</CodeBlock>
      </Section>

      <Section title="Sitecore backend">
        <ol className="grid list-decimal gap-(--abc-spacing-gap-xs) pl-(--abc-spacing-inset-xl) text-body-sm text-(--abc-text-default-secondary)">
          <li>
            For reusable content, add a Single-Line Text datasource field named <code>icon</code>{' '}
            and optionally <code>iconLabel</code>.
          </li>
          <li>
            For placement-only configuration, add <code>icon</code> to the rendering parameters
            template and read <code>params.icon</code>.
          </li>
          <li>Publish the template and related Sitecore items to the target environment.</li>
          <li>Publish the template and related Sitecore items to the target environment.</li>
          <li>
            Store a value such as <code>interface/general/search-lg</code>, without{' '}
            <code>/icons/</code> or <code>.svg</code>.
          </li>
        </ol>
        <p className="rounded-(--abc-radius-md) border border-(--abc-border-default-secondary) bg-(--abc-surface-default-secondary) p-(--abc-spacing-inset-lg) text-body-sm text-(--abc-text-default-secondary)">
          Sitecore templates live outside this repository. This library defines and validates the
          value contract; a backend developer still needs to configure the CMS field.
        </p>
      </Section>

      <Section title="Content SDK rendering">
        <CodeBlock>{datasourceExample}</CodeBlock>
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          <code>SitecoreIcon</code> treats CMS input as untrusted. Unknown, missing, and quarantined
          names use <code>interface/general/placeholder</code>. Legacy two-segment Interface names
          are temporarily mapped to their canonical subcategory names while XM Cloud content is
          migrated. Pass <code>fallback={'{null}'}</code> only when the intended behavior is to
          render nothing.
        </p>
      </Section>

      <Section title="Accessibility">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          Decorative icons use <code>aria-hidden</code>. Standalone meaningful icons use an{' '}
          <code>aria-label</code>. For icon-only controls, label the control and hide the icon so
          the accessible name is announced once.
        </p>
        <CodeBlock>{accessibilityExample}</CodeBlock>
      </Section>

      <Section title="Social icon styles">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          Social icons include the approved Figma Brand and Gray variants. Use the platform name for
          Brand and append <code>-gray</code> for Gray. These are fixed-palette assets, so the
          semantic color control is hidden.
        </p>
        <CodeBlock>{`<abcIcon name="miscellaneous/social/facebook" aria-label="Facebook" />
<abcIcon name="miscellaneous/social/facebook-gray" aria-label="Facebook" />`}</CodeBlock>
      </Section>

      <Section title="Semantic color tokens">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          Monochrome icons accept semantic colors such as <code>brand-primary</code>, which resolves
          to <code>--abc-foreground-brand-primary</code>. Full-color artwork keeps its approved
          palette.
        </p>
      </Section>

      <Section title="Updating approved icons">
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          Update <code>design-tokens/icons/inventory.json</code> and the matching SVG exports, then
          build the generated registry. CI uses the read-only check command to reject stale registry
          or SVG output. See <code>docs/ICONS.md</code> for the complete workflow.
        </p>
        <CodeBlock>{updateCommands}</CodeBlock>
      </Section>
    </main>
  );
}
