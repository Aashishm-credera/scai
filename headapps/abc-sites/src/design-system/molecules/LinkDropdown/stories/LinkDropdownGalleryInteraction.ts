import { expect, userEvent, within } from 'storybook/test';

export async function verifyLinkDropdownGallery(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const breadcrumb = canvas.getByRole('navigation', {
    name: 'Gallery hidden breadcrumb pages breadcrumb',
  });
  const breadcrumbContent = within(breadcrumb);
  const pageLinks = breadcrumbContent.getAllByRole('link');
  const trigger = breadcrumbContent.getByRole('button', {
    name: 'Show hidden breadcrumb pages',
  });
  const separators = breadcrumb.querySelectorAll('[data-breadcrumb-separator]');

  await expect(pageLinks.map((link) => link.textContent)).toEqual(['Home', 'Healthy Eating']);
  await expect(pageLinks.every((link) => link.querySelector('svg') === null)).toBe(true);
  await expect(trigger).toHaveClass('link-dropdown-trigger');
  await expect(trigger).toHaveAttribute('type', 'button');

  for (const separator of separators) {
    await expect(separator).toHaveAttribute('aria-hidden', 'true');
    await expect(separator).toHaveClass('pointer-events-none');
    await expect(separator.querySelector('a, button')).toBeNull();
  }

  await userEvent.click(trigger);
  const dropdown = within(
    await body.findByRole('navigation', { name: 'Gallery hidden breadcrumb pages' })
  );
  const hiddenPage = dropdown.getByRole('link', { name: 'Healthy Living' });
  await userEvent.tab();
  await expect(hiddenPage).toHaveFocus();
}
