const sitecoreLinkExample = `import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { Button } from '@/design-system/atoms/BaseButton';

<Button
  variant="primary"
  linkField={rendering.fields?.link as LinkField}
  icon="interface/arrows/arrow-right"
  styles="button-icon-right"
/>`;

const plainLinkExample = `import { Button } from '@/design-system/atoms/BaseButton';

<Button
  variant="secondary"
  link={{
    url: '/heart-health',
    title: 'Heart health',
    target: '_self',
  }}
  styles=""
/>`;

const breadcrumbExample = `<Button
  variant="link"
  link={{
    url: breadcrumb.url,
    title: breadcrumb.title,
    target: breadcrumb.target,
  }}
  styles=""
/>`;

const sitecoreAdapterExample = `export function Default({ rendering, params }: ComponentProps) {
  return (
    <Button
      variant="primary"
      linkField={rendering.fields?.link as LinkField}
      icon={safelyDeriveIconName(rendering.fields?.icon)}
      styles={params?.Styles ?? ''}
    />
  );
}`;

export function ButtonDocumentation() {
  return (
    <article className="grid max-w-3xl gap-6">
      <h1 className="text-heading-md">Button usage</h1>
      <p>
        Button is a navigation component with two supported link sources: a Sitecore General Link
        field and a plain link object. It always renders one anchor. A valid Sitecore linkField has
        priority when both sources are present; an invalid source renders nothing unless the other
        source is valid.
      </p>

      <h2 className="text-heading-sm">Sitecore linkField</h2>
      <p>
        The Sitecore path renders the Content SDK Link component directly. The authored General Link
        URL is the destination and value.text is the only React child and visible accessible name.
        Supplying that text explicitly keeps the label current across Page Builder rerenders without
        asking the SDK to render a duplicate copy.
      </p>
      <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-4">
        <code>{sitecoreLinkExample}</code>
      </pre>

      <h2 className="text-heading-sm">Plain link</h2>
      <p>
        The plain path uses Next.js Link with url as href, title as visible text, and the optional
        target. Links opening a new tab receive noopener and noreferrer automatically.
      </p>
      <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-4">
        <code>{plainLinkExample}</code>
      </pre>

      <h2 className="text-heading-sm">Breadcrumb compatibility</h2>
      <p>A Breadcrumb can pass its existing values directly through the plain link contract.</p>
      <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-4">
        <code>{breadcrumbExample}</code>
      </pre>

      <h2 className="text-heading-sm">Variants, styles, and icons</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          primary, secondary, tertiary, and link select their Tailwind classes and add a matching
          *-button hook class.
        </li>
        <li>styles is optional and carries the Sitecore rendering styles onto the anchor.</li>
        <li>
          A registered icon is drawn by the anchor&apos;s ::after. button-icon-right in styles
          places it after the label; otherwise the icon defaults to the left.
        </li>
        <li>
          The label is the anchor&apos;s only child, so Page builder can edit the link text in
          place. Primary and secondary paint their gradient on ::before, and labels remain on one
          line.
        </li>
        <li>
          disabled and isLoading keep the link keyboard-focusable and aria-disabled prevents
          activation. Disabled links append “disabled” to their accessible name; loading links use
          “Loading” as their accessible name and apply aria-busy with the Figma spinner. isCurrent
          applies
          aria-current=&quot;page&quot; for the selected secondary state.
        </li>
        <li>
          Responsive tokens match the 390, 768, 1280, and 1600px Figma frames. Primary, secondary,
          and tertiary animate only their decorative surface to 103% over 90ms; link changes color
          without creating or scaling a surface. Reduced motion removes these durations and pauses
          the loading spinner.
        </li>
      </ul>

      <h2 className="text-heading-sm">Sitecore rendering adapter</h2>
      <p>
        Default, Secondary, Tertiary, and Link map the existing rendering fields and Styles
        parameter to Button. Missing fields and parameters are handled without throwing.
      </p>
      <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-4">
        <code>{sitecoreAdapterExample}</code>
      </pre>
    </article>
  );
}
