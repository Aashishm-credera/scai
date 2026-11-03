import NextLink from 'next/link';
import Image from 'next/image';
import { Image as SitecoreImage, Text } from '@sitecore-content-sdk/nextjs';
import { SubHeadingText } from '@/design-system/atoms/SubHeadingText';
import { abcIcon } from '@/design-system/design/icons';
import type { DetailPageLinkItem, DetailPageLinksListProps } from './detail-page-links-list.props';
import { cn } from '@/design-system/lib/cn';

const cardsClassName =
  'detail-page-links-list-cards m-0 flex list-none flex-col gap-(--abc-spacing-gap-md) p-0';
const cardClassName = [
  'detail-page-links-list-card group/detail-page-link relative isolate flex w-full min-w-0 items-center',
  'min-h-(--abc-size-lg) p-(--abc-spacing-inset-lg) rounded-(--abc-radius-lg) no-underline',
  'focus-visible:outline-2 focus-visible:outline-offset-(--abc-space-2)',
  'focus-visible:outline-(--abc-border-focus)',
].join(' ');
const surfaceClassName = [
  'detail-page-links-list-surface pointer-events-none absolute inset-0 -z-10 rounded-[inherit]',
  'bg-linear-to-b from-(--abc-surface-default-primary) to-(--abc-surface-default-secondary)',
  'group-hover/detail-page-link:from-(--abc-surface-default-secondary)',
  'group-hover/detail-page-link:to-(--abc-surface-default-tertiary)',
  // Keep the existing medium elevation; there is no shared utility for this composition.
  'shadow-[var(--abc-effect-elevation-medium-neutral-inner-highlight-offset-x)_var(--abc-effect-elevation-medium-neutral-inner-highlight-offset-y)_var(--abc-effect-elevation-medium-neutral-inner-highlight-blur)_var(--abc-effect-elevation-medium-neutral-inner-highlight-spread)_var(--abc-color-effect-elevation-medium-neutral-inner-highlight)_inset,_var(--abc-effect-elevation-medium-neutral-inner-shade-offset-x)_var(--abc-effect-elevation-medium-neutral-inner-shade-offset-y)_var(--abc-effect-elevation-medium-neutral-inner-shade-blur)_var(--abc-effect-elevation-medium-neutral-inner-shade-spread)_var(--abc-color-effect-elevation-medium-neutral-inner-shade)_inset,_var(--abc-effect-elevation-medium-neutral-outer-hover-far-offset-x)_var(--abc-effect-elevation-medium-neutral-outer-hover-far-offset-y)_var(--abc-effect-elevation-medium-neutral-outer-hover-far-blur)_var(--abc-effect-elevation-medium-neutral-outer-hover-far-spread)_var(--abc-color-effect-elevation-medium-neutral-outer-hover-far),_var(--abc-effect-elevation-medium-neutral-outer-hover-mid-offset-x)_var(--abc-effect-elevation-medium-neutral-outer-hover-mid-offset-y)_var(--abc-effect-elevation-medium-neutral-outer-hover-mid-blur)_var(--abc-effect-elevation-medium-neutral-outer-hover-mid-spread)_var(--abc-color-effect-elevation-medium-neutral-outer-hover-mid),_var(--abc-effect-elevation-medium-neutral-outer-hover-near-offset-x)_var(--abc-effect-elevation-medium-neutral-outer-hover-near-offset-y)_var(--abc-effect-elevation-medium-neutral-outer-hover-near-blur)_var(--abc-effect-elevation-medium-neutral-outer-hover-near-spread)_var(--abc-color-effect-elevation-medium-neutral-outer-hover-near)]',
].join(' ');
const contentClassName =
  'detail-page-links-list-content flex min-w-0 flex-1 items-center gap-(--abc-spacing-gap-xl)';
const imageClassName = [
  'detail-page-links-list-image relative shrink-0 overflow-hidden rounded-(--abc-radius-xs)',
  'w-[calc(var(--abc-size-lg)*5/4)] h-(--abc-size-lg) aspect-5/4',
].join(' ');
const textClassName =
  'detail-page-links-list-text flex min-w-0 flex-1 flex-col gap-(--abc-space-3)';
const cardTitleClassName = [
  'detail-page-links-list-title m-0 whitespace-normal [overflow-wrap:anywhere] text-pretty',
  'text-heading-xs text-(--abc-text-default-tertiary)',
].join(' ');
const descriptionClassName = [
  'detail-page-links-list-description m-0 whitespace-normal [overflow-wrap:anywhere] text-pretty',
  'text-body-sm text-(--abc-text-default-secondary)',
].join(' ');
const chevronClassName =
  'detail-page-links-list-chevron flex shrink-0 items-center text-(--abc-foreground-default-quaternary)';

function CardContent({ item, isEditing }: { item: DetailPageLinkItem; isEditing: boolean }) {
  const width = Number(item.image?.value.width);
  const height = Number(item.image?.value.height);
  const hasDimensions =
    Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0;
  return (
    <>
      <span className={surfaceClassName} aria-hidden="true" />
      <div className={contentClassName}>
        {isEditing && item.image ? (
          <div className={imageClassName}>
            <SitecoreImage field={item.image} className="block h-full w-full object-cover" />
          </div>
        ) : (
          item.image?.value.src && (
            <div className={imageClassName}>
              <Image
                src={item.image.value.src}
                alt={item.image.value.alt}
                {...(hasDimensions ? { width, height } : { fill: true })}
                sizes="60px"
                className="block h-full w-full object-cover"
              />
            </div>
          )
        )}
        <div className={textClassName}>
          <Text tag="h4" field={item.title} className={cardTitleClassName} />
          {item.description && (item.description.value || isEditing) && (
            <Text tag="div" field={item.description} className={descriptionClassName} />
          )}
        </div>
      </div>
      <span className={chevronClassName} aria-hidden="true">
        <abcIcon name="interface/arrows/chevron-right" size="md" aria-hidden />
      </span>
    </>
  );
}

/** In Page Builder the cards are not links, so clicking a field edits it instead of navigating. */
export function DetailPageLinksList({
  id,
  className,
  heading,
  cards,
  isEditing = false,
}: DetailPageLinksListProps) {
  const renderedCards = cards.flatMap((item) => {
    const href = item.link?.value.href;
    const safeHref = href && /^(?:https?:|mailto:|tel:|[^:]*$)/i.test(href) ? href : undefined;
    if (!safeHref && !isEditing) return [];
    const target = item.link?.value.target;
    const content = <CardContent item={item} isEditing={isEditing} />;
    return [
      <li key={item.id} className="min-w-0">
        {safeHref && !isEditing ? (
          <NextLink
            href={safeHref}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            aria-label={item.ariaLabel}
            className={cardClassName}
          >
            {content}
          </NextLink>
        ) : (
          <div className={cardClassName}>{content}</div>
        )}
        {isEditing && !safeHref && <span className="is-empty-hint">Select a Page Item</span>}
      </li>,
    ];
  });
  if (!renderedCards.length && !isEditing) return null;
  return (
    <section id={id} className={cn('detail-page-links-list w-full min-w-0', className)}>
      <SubHeadingText
        SubHeadingField={heading}
        isEditing={isEditing}
        className="detail-page-links-list-heading"
      />
      <ul className={cardsClassName}>{renderedCards}</ul>
    </section>
  );
}
