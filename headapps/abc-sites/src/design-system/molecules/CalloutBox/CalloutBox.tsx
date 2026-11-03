import {
  Text,
  type FieldMetadata,
  type LinkField,
  type RichTextField,
  type TextField,
} from '@sitecore-content-sdk/nextjs';
import { Button } from '@/design-system/atoms/BaseButton';
import { DescriptionText } from '@/design-system/atoms/DescriptionText';
import { SitecoreIcon } from '@/design-system/design/icons';
import { cn } from '@/design-system/lib/cn';

export type ContentSdkLinkField = LinkField & FieldMetadata;

export interface CalloutBoxUIProps {
  Icon?: string;
  id?: string;
  LinkField?: ContentSdkLinkField | null;
  TitleField?: TextField | null;
  DescriptionField?: RichTextField | null;
  styles?: string;
  isPageEditing?: boolean;
}

export function CalloutBox({
  Icon,
  id,
  LinkField,
  TitleField,
  DescriptionField,
  styles,
  isPageEditing = false,
}: CalloutBoxUIProps) {
  const hasIcon = Boolean(Icon?.trim());
  const hasTitle =
    (typeof TitleField?.value === 'string'
      ? Boolean(TitleField.value.trim())
      : Boolean(TitleField?.value)) ||
    (isPageEditing && Boolean(TitleField));
  const hasDescription =
    Boolean(DescriptionField?.value?.trim()) || (isPageEditing && Boolean(DescriptionField));
  const hasLink =
    Boolean(LinkField?.value?.href?.trim() && LinkField.value.text?.trim()) ||
    (isPageEditing && Boolean(LinkField));

  if (!hasIcon && !hasTitle && !hasDescription && !hasLink) return null;

  return (
    <section
      id={id}
      className={cn(
        'component flex w-full min-w-0 max-w-[485px] flex-col overflow-hidden rounded-abc-radius-lg border border-abc-border-default-secondary bg-abc-surface-default-primary text-abc-text-default-primary md:max-w-[756px] lg:max-w-[924px]',
        styles
      )}
      data-class-change
    >
      <div className="component-content">
        {(hasIcon || hasTitle) && (
          <div
            className={cn(
              'flex min-h-abc-buttons-height-md min-w-0 items-center gap-abc-spacing-gap-sm self-stretch bg-abc-surface-default-secondary px-abc-spacing-inset-lg text-abc-text-default-primary text-pretty',
              'in-[.callout-title-negative]:bg-abc-feedback-error-bg-primary in-[.callout-title-negative]:text-abc-feedback-error-text-primary',
              'in-[.callout-box--negative]:bg-abc-feedback-error-bg-primary in-[.callout-box--negative]:text-abc-feedback-error-text-primary',
              'in-[.callout-title-success]:bg-abc-feedback-success-bg-primary in-[.callout-title-success]:text-abc-feedback-success-text-primary',
              'in-[.callout-box--success]:bg-abc-feedback-success-bg-primary in-[.callout-box--success]:text-abc-feedback-success-text-primary'
            )}
            data-callout-header
          >
            {hasIcon && (
              <SitecoreIcon
                name={Icon}
                fallback={null}
                size="xl"
                aria-hidden="true"
                className="shrink-0"
              />
            )}
            {hasTitle && (
              <Text
                tag="h3"
                field={TitleField ?? undefined}
                className="!block !gap-0 !pb-0 min-w-0 wrap-anywhere !font-bold !text-heading-xs !leading-(--abc-font-line-height-heading-xs) text-pretty !text-abc-text-default-primary in-[.callout-title-negative]:!text-abc-feedback-error-text-primary in-[.callout-box--negative]:!text-abc-feedback-error-text-primary in-[.callout-title-success]:!text-abc-feedback-success-text-primary in-[.callout-box--success]:!text-abc-feedback-success-text-primary"
              />
            )}
          </div>
        )}

        {(hasDescription || hasLink) && (
          <div className="flex min-w-0 flex-col items-start gap-abc-spacing-gap-sm px-abc-spacing-inset-xl py-abc-spacing-inset-lg">
            {hasDescription && (
              <DescriptionText
                DescriptionField={DescriptionField ?? undefined}
                size="m"
                isEditing={isPageEditing}
                className="text-pretty [&_ol>li]:text-body-sm [&_ol>li]:font-bold"
              />
            )}
            {hasLink && (
              <Button
                variant="tertiary"
                linkField={LinkField ?? undefined}
                icon="interface/arrows/chevron-right"
                styles="button-icon-right !text-label-md"
                editingPlaceholder={isPageEditing ? '[Add callout link]' : undefined}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
