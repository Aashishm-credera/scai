import { RichText, Text, type RichTextField, type TextField } from '@sitecore-content-sdk/nextjs';
import { SitecoreIcon } from '@/design-system/design/icons';
import { cn } from '@/design-system/lib/cn';

export interface EmergencyCalloutProps {
  Icon?: string | null;
  id?: string;
  TitleField?: TextField | null;
  DescriptionField?: RichTextField | TextField | null;
  className?: string;
  isPageEditing?: boolean;
  styles?: string
}

export function EmergencyCallout({
  Icon,
  id,
  TitleField,
  DescriptionField,
  className,
  styles
}: EmergencyCalloutProps) {
  const richTextDescription: RichTextField | undefined = DescriptionField
    ? {
        ...DescriptionField,
        value: typeof DescriptionField.value === 'string' ? DescriptionField.value : '',
      }
    : undefined;

  return (
    <section
      id={id}
      className={cn(
        'component flex min-h-abc-size-lg w-full min-w-[min(100%,320px)] max-w-abc-layout-width-640 flex-row items-start justify-center gap-abc-spacing-gap-lg rounded-abc-radius-xl border border-abc-feedback-error-border-subtle bg-abc-feedback-error-bg-primary p-abc-spacing-inset-xl',
        styles,
        className
      )}
    >
      <SitecoreIcon
        name={Icon}
        fallback={null}
        size="xl"
        aria-hidden="true"
        className="shrink-0 text-abc-feedback-error-text-primary"
      />
      <div className="grid min-w-0 flex-1 gap-abc-spacing-gap-sm">
        <Text
          tag="h3"
          field={TitleField ?? undefined}
          className="block min-w-0 wrap-anywhere text-(length:--abc-font-size-label-md) leading-(--abc-font-line-height-label-md) font-bold text-abc-feedback-error-text-primary"
        />
        <RichText
          tag="div"
          field={richTextDescription}
          className="min-w-0 wrap-anywhere whitespace-normal text-(length:--abc-font-size-text-sm) leading-(--abc-font-line-height-text-sm) font-medium text-abc-feedback-error-text-primary"
        />
      </div>
    </section>
  );
}
