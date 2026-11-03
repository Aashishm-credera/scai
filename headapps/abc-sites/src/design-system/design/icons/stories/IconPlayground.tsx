import { abcIcon } from '../abcIcon';
import { getIconDefinition, resolveIconName } from '../registry';
import { iconColors, type IconColor, type IconName, type IconSize } from '../types';

export type IconPlaygroundProps = {
  name: IconName;
  size: IconSize;
  color?: IconColor;
  decorative: boolean;
  label?: string;
};

export function isIconColorApplicable(name: unknown): boolean {
  const safeName = resolveIconName(name, null);
  return safeName ? getIconDefinition(safeName).colorMode === 'monochrome' : false;
}

export function IconPlayground({ name, size, color, decorative, label }: IconPlaygroundProps) {
  const safeName = resolveIconName(name) ?? 'interface/general/placeholder';
  const definition = getIconDefinition(safeName);
  const colorApplicable = definition.colorMode === 'monochrome';
  const safeColor: IconColor = color && iconColors.includes(color) ? color : 'default';
  const accessibleLabel = label?.trim() || definition.name;
  const accessibilityProp = decorative
    ? 'aria-hidden'
    : `aria-label=${JSON.stringify(accessibleLabel)}`;
  const usage = `<abcIcon name=${JSON.stringify(safeName)} size=${JSON.stringify(size)}${colorApplicable ? ` color=${JSON.stringify(safeColor)}` : ''} ${accessibilityProp} />`;

  return (
    <main className="mx-auto grid max-w-3xl gap-(--abc-spacing-gap-xl) p-(--abc-spacing-inset-xl) text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-xs)">
        <h1 className="text-heading-sm font-semibold">Icon playground</h1>
        <p className="text-body-sm text-(--abc-text-default-tertiary)">
          Change the controls to test an approved icon with abc size, semantic color, and
          accessibility options. Use Storybook&apos;s Light or Dark background control to check
          contrast.
        </p>
      </header>

      <pre
        tabIndex={0}
        className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-tertiary) p-(--abc-spacing-inset-lg) text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <code>{usage}</code>
      </pre>
      <section
        aria-label="Icon preview"
        className="grid min-h-64 place-items-center rounded-(--abc-radius-lg) border border-(--abc-border-default-primary) p-(--abc-spacing-inset-4xl)"
      >
        <abcIcon
          name={safeName}
          size={size}
          color={colorApplicable ? safeColor : undefined}
          aria-hidden={decorative || undefined}
          aria-label={decorative ? undefined : accessibleLabel}
        />
      </section>
      {!colorApplicable && (
        <p className="text-body-sm text-(--abc-text-default-secondary)">
          This full-color icon preserves its approved Figma palette, so no semantic color is
          available.
        </p>
      )}
    </main>
  );
}
