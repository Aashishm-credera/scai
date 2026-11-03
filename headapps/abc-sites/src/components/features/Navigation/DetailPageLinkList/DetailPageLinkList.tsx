import { JSX } from 'react';
import type { Field, ImageField, LinkFieldValue } from '@sitecore-content-sdk/nextjs';
import { sanitizeHeadingHtml } from '@/components/foundation/heading/heading-field';
import { isSafeButtonHref } from '@/design-system/atoms/BaseButton/link-utils';
import { DetailPageLinksList } from '@/design-system/molecules/DetailPageLinksList';
import type { DetailPageLinkItem } from '@/design-system/molecules/DetailPageLinksList';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type {
  DetailPage,
  DetailPageLinkFields,
  DetailPageLinkListProps,
} from './detail-page-link-list.props';

type CardField = Field<string> | ImageField;

const textOf = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const hasValue = (field: CardField | null | undefined): boolean => {
  const value = field?.value;
  return Boolean(
    typeof value === 'string' ? value.trim() : textOf((value as { src?: unknown })?.src)
  );
};

/** The first field with a value, so an empty override falls back to the next source. */
const firstWithValue = <T extends CardField>(...fields: Array<T | null | undefined>) =>
  fields.find((field): field is T => hasValue(field));

/**
 * The Link override when it has a destination, otherwise a link to the Page Item. The href carries
 * the querystring and anchor, so the molecule only needs the final destination.
 */
const resolveLink = (card: DetailPageLinkFields, page?: DetailPage | null) => {
  const override = getFieldValue(card.Link)?.value;
  const link: LinkFieldValue = textOf(override?.href)
    ? (override ?? {})
    : { href: textOf(page?.url?.path) };
  const href = textOf(link.href);
  if (!isSafeButtonHref(href)) return undefined;

  const query = textOf(link.querystring);
  const anchor = textOf(link.anchor);
  return {
    value: {
      href: [
        href,
        query && !query.startsWith('?') ? `?${query}` : query,
        anchor && !anchor.startsWith('#') ? `#${anchor}` : anchor,
      ].join(''),
      target: textOf(link.target) || undefined,
    },
  };
};

const toDimension = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? value : undefined;

/** The molecule's image shape. Spreading the field keeps its metadata, so it stays editable. */
const toCardImage = (image: ImageField | undefined) =>
  image && {
    ...image,
    value: {
      src: textOf(image.value?.src),
      alt: textOf(image.value?.alt),
      width: toDimension(image.value?.width),
      height: toDimension(image.value?.height),
    },
  };

/** Without its editing metadata a field renders read-only in Page Builder. */
const readOnly = <T extends CardField>(field: T | undefined) =>
  field && { ...field, metadata: undefined };

/**
 * Without a Page Item the overrides are the card's only content, so Page Builder edits them inline.
 * With one, an empty override falls back to the Page Item's meta fields and the image then to the
 * site image. Page Builder shows a field's stored value, not a fallback, so these cards are
 * read-only there and authors edit the overrides in the Content Editor.
 */
const resolveCard = (
  card: DetailPageLinkFields,
  siteImage: ImageField | undefined
): DetailPageLinkItem => {
  const page = card.PageItem?.targetItem;
  const image = getFieldValue(card.Image);
  const title = getFieldValue(card.Title);
  const description = getFieldValue(card.Description);
  const shared = {
    id: card.id,
    link: resolveLink(card, page),
    ariaLabel: textOf(getFieldValue(card.AriaLabel)?.value) || undefined,
  };

  if (!page) {
    return { ...shared, image: toCardImage(image), title: title ?? { value: '' }, description };
  }

  return {
    ...shared,
    image: toCardImage(
      readOnly(firstWithValue(image, getFieldValue(page.OpenGraphImage), siteImage))
    ),
    title: readOnly(firstWithValue(title, { value: textOf(page.PageTitle?.value) })) ?? {
      value: '',
    },
    description: readOnly(
      firstWithValue(description, { value: textOf(page.MetaDescription?.value) })
    ),
  };
};

export const Default = ({ fields, params, page }: DetailPageLinkListProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing Detail Page Link List Datasource</span>
    ) : null;
  }

  const heading = getFieldValue(datasource.Heading);
  const sanitizedHeading = sanitizeHeadingHtml(heading?.value);
  const siteImage = getFieldValue(fields?.data?.siteSettings?.GlobalSocialFallbackImage);

  // A published card needs a destination and a title.
  const cards = (datasource.children?.results ?? [])
    .flatMap((card) => (card?.id ? [resolveCard(card, siteImage ?? undefined)] : []))
    .filter((card) => isEditing || (card.link && textOf(card.title.value)));

  // The heading and at least one card are required on the published page.
  if (!isEditing && (!sanitizedHeading || cards.length === 0)) {
    return null;
  }

  return (
    <DetailPageLinksList
      // Page Builder edits the authored value; the published page gets text, sup and sub only.
      heading={{ ...heading, value: isEditing ? (heading?.value ?? '') : sanitizedHeading }}
      cards={cards}
      isEditing={isEditing}
      id={params.RenderingIdentifier || undefined}
      className={params.styles?.trim() || undefined}
    />
  );
};
