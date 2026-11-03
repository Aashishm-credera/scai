import { abcLogo } from '../abcLogo';
import {
  getLogoAsset,
  getLogoDefinition,
  isLogoSize,
  isLogoVariant,
  resolveLogoName,
} from '../registry';
import type { LogoName, LogoSize, LogoVariant } from '../types';

export type LogoPlaygroundProps = {
  name: LogoName;
  size: LogoSize;
  variant: LogoVariant;
  decorative: boolean;
  label?: string;
};

export function LogoPlayground({ name, size, variant, decorative, label }: LogoPlaygroundProps) {
  const safeName = resolveLogoName(name) ?? 'abc/wordmark';
  const safeSize = isLogoSize(size) ? size : 'md';
  const safeVariant = isLogoVariant(variant) ? variant : 'default';
  const definition = getLogoDefinition(safeName);
  const { variant: renderedVariant } = getLogoAsset(definition, safeSize, safeVariant);
  const accessibleLabel = label?.trim() || definition.label;
  const alt = decorative ? '' : accessibleLabel;
  const usage = `<abcLogo name=${JSON.stringify(safeName)} size=${JSON.stringify(safeSize)} variant=${JSON.stringify(renderedVariant)} alt=${JSON.stringify(alt)} />`;

  return (
    <main className="mx-auto grid max-w-3xl gap-(--abc-spacing-gap-xl) p-(--abc-spacing-inset-xl) text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-xs)">
        <h1 className="text-heading-sm font-semibold">Logo playground</h1>
        <p className="text-body-sm text-(--abc-text-default-tertiary)">
          Approved logos retain their brand palette. Use Storybook&apos;s Light or Dark background
          control to check contrast.
        </p>
      </header>

      <pre
        tabIndex={0}
        className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-tertiary) p-(--abc-spacing-inset-lg) text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <code>{usage}</code>
      </pre>
      <section
        aria-label="Logo preview"
        className="grid min-h-64 place-items-center rounded-(--abc-radius-lg) border border-(--abc-border-default-primary) p-(--abc-spacing-inset-4xl)"
      >
        <abcLogo name={safeName} size={safeSize} variant={safeVariant} alt={alt} />
      </section>
    </main>
  );
}
