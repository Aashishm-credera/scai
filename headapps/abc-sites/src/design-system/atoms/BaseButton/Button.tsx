import {
  Link as ContentSdkLink,
  type FieldMetadata,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import NextLink from 'next/link';
import type { AnchorHTMLAttributes, CSSProperties } from 'react';
import { getIconDefinition, resolveIconName } from '@/design-system/design/icons';
import { buttonVariants, isButtonVariant } from './button-variants';
import { isSafeButtonHref } from './link-utils';
import type { ButtonActionProps } from './button-action.props';

export type Link = {
  url: string;
  title: string;
  target?: string;
};

export type ContentSdkLinkField = LinkField & FieldMetadata;

export interface ButtonProps {
  variant: string;
  link?: Link;
  linkField?: ContentSdkLinkField;
  icon?: string;
  styles?: string;
  /** Uses the Figma disabled treatment while retaining the authored destination for Page Builder. */
  disabled?: boolean;
  /** Uses the Figma loading treatment and prevents navigation until loading completes. */
  isLoading?: boolean;
  /** Marks a secondary navigation link as the current page. */
  isCurrent?: boolean;
  /**
   * Label shown in Page Builder while the link is still empty, so authors see the button design
   * instead of nothing. Leave unset outside editing.
   */
  editingPlaceholder?: string;
}

/**
 * The icon travels as attributes on the anchor, drawn by its ::after (see button-variants.ts),
 * because Page builder replaces the anchor's children when an author edits the link text.
 */
type IconAttributes = {
  className: string;
  'data-icon-color-mode': 'monochrome' | 'multicolor';
  'data-icon-name': string;
  style: CSSProperties & { '--button-icon-image': string };
};

type ValidLinkField = {
  field: ContentSdkLinkField;
  label: string;
  target?: string;
};

type ValidLink = {
  href: string;
  label: string;
  target?: string;
};

function isVisibleText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getAccessibleLabel(label: string, disabled?: boolean, isLoading?: boolean) {
  if (isLoading) return 'Loading';
  return disabled ? `${label}, disabled` : label;
}

function getValidLinkField(linkField?: ContentSdkLinkField): ValidLinkField | null {
  if (!linkField) return null;

  const href = linkField?.value?.href;
  const label = linkField?.value?.text;

  if (!isVisibleText(href) || !isSafeButtonHref(href) || !isVisibleText(label)) return null;

  return {
    field: linkField,
    label,
    target: isVisibleText(linkField.value.target) ? linkField.value.target : undefined,
  };
}

function getValidLink(link?: Link): ValidLink | null {
  if (!isVisibleText(link?.url) || !isSafeButtonHref(link.url) || !isVisibleText(link.title)) {
    return null;
  }

  return {
    href: link.url,
    label: link.title,
    target: isVisibleText(link.target) ? link.target : undefined,
  };
}

/**
 * The field to render while the link is incomplete in Page Builder. The field metadata is kept so
 * the placeholder stays editable, but an unsafe destination is never written to the page.
 */
function getPlaceholderLinkField(linkField?: ContentSdkLinkField): ContentSdkLinkField {
  const href = linkField?.value?.href;
  const hasSafeHref = isVisibleText(href) && isSafeButtonHref(href);

  return { ...linkField, value: { ...linkField?.value, href: hasSafeHref ? href : '' } };
}

function getIconAttributes(icon: string | undefined): IconAttributes | null {
  const name = resolveIconName(icon, null);
  if (!name) return null;

  const definition = getIconDefinition(name);

  return {
    className: `icon-${name.slice(name.lastIndexOf('/') + 1)}`,
    'data-icon-color-mode': definition.colorMode,
    'data-icon-name': name,
    style: { '--button-icon-image': `url("${definition.assetPath}")` },
  };
}

function getInteractionProps({
  disabled,
  isCurrent,
  isLoading,
}: Pick<ButtonProps, 'disabled' | 'isCurrent' | 'isLoading'>) {
  const isUnavailable = Boolean(disabled || isLoading);

  return {
    'aria-busy': isLoading || undefined,
    'aria-current': isCurrent ? 'page' : undefined,
    'aria-disabled': isUnavailable ? true : undefined,
    onClick: isUnavailable ? (event) => event.preventDefault() : undefined,
  } satisfies AnchorHTMLAttributes<HTMLAnchorElement>;
}

function AnchorButton({
  variant,
  link,
  linkField,
  icon,
  styles = '',
  disabled,
  isLoading,
  isCurrent,
  editingPlaceholder,
}: ButtonProps) {
  const presentation = isButtonVariant(variant) ? variant : 'primary';
  const { className: iconClassName = '', ...iconAttributes } = getIconAttributes(icon) ?? {};
  // Everything but the label lives on the anchor: the label must stay its only child.
  const anchorProps = {
    ...getInteractionProps({ disabled, isCurrent, isLoading }),
    ...iconAttributes,
    role: 'link' as const,
    className: buttonVariants({
      variant: presentation,
      // `component` marks the rendering root, as SXA renderings do.
      className: `component ${variant}-button ${iconClassName} ${styles}`,
    }),
  };
  const validLinkField = getValidLinkField(linkField);

  if (validLinkField) {
    return (
      <ContentSdkLink
        {...anchorProps}
        field={validLinkField.field}
        aria-label={getAccessibleLabel(validLinkField.label, disabled, isLoading)}
        rel={validLinkField.target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {validLinkField.label}
      </ContentSdkLink>
    );
  }

  if (!validLinkField && isVisibleText(editingPlaceholder)) {
    const authoredLabel = linkField?.value?.text;
    const placeholderLabel = isVisibleText(authoredLabel) ? authoredLabel : editingPlaceholder;

    return (
      <ContentSdkLink
        {...anchorProps}
        field={getPlaceholderLinkField(linkField)}
        aria-label={getAccessibleLabel(placeholderLabel, disabled, isLoading)}
        renderChildrenWhenEmpty
        data-class-change
      >
        {placeholderLabel}
      </ContentSdkLink>
    );
  }
  
  const validLink = getValidLink(link);
  if (!validLink) return null;

  return (
    <NextLink
      {...anchorProps}
      href={validLink.href}
      aria-label={getAccessibleLabel(validLink.label, disabled, isLoading)}
      target={validLink.target}
      rel={validLink.target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      {validLink.label}
    </NextLink>
  );
}

/** Renders one navigation anchor from a valid Sitecore field or plain link. */
export function Button(props: ButtonProps) {
  return <AnchorButton {...props} />;
}

/** Native action control using the same presentation and icons as BaseButton links. */
export function ButtonAction({
  variant = 'secondary',
  icon,
  styles = '',
  className,
  children,
  type = 'button',
  ...props
}: ButtonActionProps) {
  const {
    className: iconClassName = '',
    style: iconStyle,
    ...iconAttributes
  } = getIconAttributes(icon) ?? {};

  return (
    <button
      {...props}
      {...iconAttributes}
      type={type}
      aria-disabled={props.disabled || props['aria-disabled'] || undefined}
      className={buttonVariants({
        variant,
        className: `component ${variant}-button ${iconClassName} ${styles} ${className ?? ''}`,
      })}
      style={{ ...iconStyle, ...props.style }}
    >
      {children}
    </button>
  );
}
