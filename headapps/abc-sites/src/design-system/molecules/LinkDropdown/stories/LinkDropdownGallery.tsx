import { BreadcrumbExample } from './LinkDropdownGalleryParts';

export function LinkDropdownGallery() {
  return (
    <main
      id="link-dropdown-gallery"
      className="grid max-w-3xl gap-10 text-(--abc-text-default-primary)"
      onClickCapture={(event) => {
        if ((event.target as Element).closest('a')) event.preventDefault();
      }}
    >
      <section aria-labelledby="breadcrumb-example-heading" className="grid gap-4">
        <div className="grid gap-2">
          <h2 id="breadcrumb-example-heading" className="text-heading-xs font-semibold">
            Breadcrumb overflow
          </h2>
          <p className="max-w-3xl text-body-md text-(--abc-text-default-secondary)">
            Use the ellipsis to open the hidden breadcrumb page. Tab moves from the trigger to the
            link, and Escape closes the popup.
          </p>
        </div>
        <div className="flex min-h-80 items-start rounded-(--abc-radius-xl) border border-(--abc-border-default-secondary) bg-(--abc-surface-default-secondary) p-(--abc-spacing-inset-xl)">
          <BreadcrumbExample navigationLabel="Gallery hidden breadcrumb pages" />
        </div>
      </section>
    </main>
  );
}
