const localExample = `type BreadcrumbLink = {
  url: string;
  pageName: string;
};

const breadcrumbsLinks: readonly BreadcrumbLink[] = [
  { url: '/en', pageName: 'Home' },
  { url: '/en/healthy-living', pageName: 'Healthy Living' },
  {
    url: '/en/healthy-living/healthy-eating',
    pageName: 'Healthy Eating',
  },
];

const hiddenBreadcrumbLinks = breadcrumbsLinks.slice(1, -1);

<LinkDropdown
  triggerLabel="Show hidden breadcrumb pages"
  items={hiddenBreadcrumbLinks.map(({ url, pageName }) => ({
    id: url,
    href: url,
    label: pageName,
  }))}
/>`;

const sitecoreExample = `type ResolvedDropdownItem = {
  id: string;
  labelField: Field<string>;
  linkField: LinkField;
};

function SitecoreLinkDropdownExample({
  items,
}: {
  items: readonly ResolvedDropdownItem[];
}) {
  return (
    <LinkDropdown
      triggerLabel="Show hidden breadcrumb pages"
      items={items.map((item) => ({
        id: item.id,
        label: <Text field={item.labelField} />,
        link: <ContentSdkLink field={item.linkField} />,
      }))}
    />
  );
}`;

const stylingExample = `<span className="link-dropdown inline-flex">
  <button className="link-dropdown-trigger min-h-(--abc-buttons-height-sm) ...">...</button>
</span>

<div className="link-dropdown-popup min-w-[16.875rem] ...">
  <nav className="link-dropdown-navigation">
    <ul className="link-dropdown-list grid min-w-max ...">
      <li className="link-dropdown-list-item">
        <a className="link-dropdown-item flex ...">
          <span className="link-dropdown-item-content flex flex-1 ...">Healthy Living</span>
        </a>
      </li>
    </ul>
  </nav>
</div>`;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      tabIndex={0}
      className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-tertiary) p-(--abc-spacing-inset-lg) text-body-sm focus-visible:shadow-[0_0_0_var(--abc-space-4)_var(--abc-surface-default-primary)] focus-visible:outline-2 focus-visible:outline-offset-(--abc-space-4) focus-visible:outline-(--abc-border-focus)"
    >
      <code>{children}</code>
    </pre>
  );
}

export function LinkDropdownDocumentation() {
  return (
    <article className="grid max-w-3xl gap-6">
      <h1 className="text-heading-md">Link dropdown usage</h1>
      <p>
        LinkDropdown reveals breadcrumb ancestors that do not fit inline. Its native ellipsis
        trigger uses the shared Button link tokens, while every destination remains a navigation
        link.
      </p>

      <h2 className="text-heading-sm">Using it in a breadcrumb</h2>
      <p>
        Pass only the hidden intermediary pages to the component. Keep Home and the current visible
        parent in the breadcrumb, and preserve the source order of collapsed pages.
      </p>
      <CodeBlock>{localExample}</CodeBlock>

      <h2 className="text-heading-sm">Styling classes</h2>
      <p>
        The component is styled with Tailwind utilities and abc design tokens. Stable link-dropdown
        classes remain available as hooks for selectors and tests.
      </p>
      <CodeBlock>{stylingExample}</CodeBlock>

      <h2 className="text-heading-sm">Behavior and accessibility</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>The trigger opens on press, hover, or keyboard focus.</li>
        <li>Tab reaches each link, Enter follows it, and Escape closes the popup.</li>
        <li>The popup shifts or flips to remain inside the viewport.</li>
        <li>Labels stay on one line and the popup grows to the longest label.</li>
      </ul>

      <h2 className="text-heading-sm">Sitecore link slots</h2>
      <p>
        A Sitecore adapter can pass editable Text content as the label and ContentSdkLink as the
        link root. No function crosses the server/client boundary.
      </p>
      <CodeBlock>{sitecoreExample}</CodeBlock>
    </article>
  );
}
