import { Button } from '@/design-system/atoms/BaseButton';
import { abcIcon } from '@/design-system/design/icons';
import { LinkDropdown, type LinkDropdownItem } from '@/design-system/molecules/LinkDropdown';

type BreadcrumbLink = {
  url: string;
  pageName: string;
};

const breadcrumbsLinks: readonly BreadcrumbLink[] = [
  { url: '/en', pageName: 'Home' },
  { url: '/en/healthy-living', pageName: 'Healthy Living' },
  { url: '/en/healthy-living/healthy-eating', pageName: 'Healthy Eating' },
];

const compactHiddenItems = breadcrumbsLinks.slice(1, -1).map(({ url, pageName }) => ({
  id: url,
  href: url,
  label: pageName,
})) satisfies readonly LinkDropdownItem[];

function BreadcrumbPageLink({
  item,
  truncate = false,
}: {
  item: BreadcrumbLink;
  truncate?: boolean;
}) {
  return (
    <li
      data-breadcrumb-link=""
      className={
        truncate
          ? 'min-w-0 overflow-hidden [&>a]:block [&>a]:max-w-full [&>a]:overflow-hidden [&>a]:text-ellipsis [&>a]:whitespace-nowrap'
          : 'shrink-0'
      }
    >
      <Button variant="link" link={{ url: item.url, title: item.pageName }} styles="" />
    </li>
  );
}

function BreadcrumbSeparator() {
  return (
    <li
      aria-hidden="true"
      className="pointer-events-none flex size-(--abc-icon-size-sm) shrink-0 items-center justify-center text-(--abc-foreground-default-tertiary) select-none"
      data-breadcrumb-separator=""
    >
      <abcIcon aria-hidden="true" name="interface/arrows/chevron-right" size="sm" />
    </li>
  );
}

export function BreadcrumbExample({
  defaultOpen = false,
  items = compactHiddenItems,
  navigationLabel,
}: {
  defaultOpen?: boolean;
  items?: readonly LinkDropdownItem[];
  navigationLabel: string;
}) {
  return (
    <nav aria-label={`${navigationLabel} breadcrumb`}>
      <ol className="m-0 flex list-none items-center gap-(--abc-spacing-gap-sm) p-0 text-body-sm">
        <BreadcrumbPageLink item={breadcrumbsLinks[0]} />
        <BreadcrumbSeparator />
        <li>
          <LinkDropdown
            defaultOpen={defaultOpen}
            items={items}
            navigationLabel={navigationLabel}
            triggerLabel="Show hidden breadcrumb pages"
          />
        </li>
        <BreadcrumbSeparator />
        <BreadcrumbPageLink item={breadcrumbsLinks[breadcrumbsLinks.length - 1]} truncate />
      </ol>
    </nav>
  );
}
