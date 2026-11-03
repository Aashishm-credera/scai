'use client';

import {
  cloneElement,
  useRef,
  useState,
  type FocusEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import { cn } from '@/design-system/lib/cn';
import type {
  LinkDropdownHrefItem,
  LinkDropdownItem,
  LinkDropdownProps,
  LinkDropdownSlotItem,
} from './link-dropdown.props';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  type PopoverActions,
} from '@/design-system/ui/popover';

export type {
  LinkDropdownHrefItem,
  LinkDropdownItem,
  LinkDropdownProps,
  LinkDropdownSlotItem,
} from './link-dropdown.props';

const POSITION_GAP = 4;
const VIEWPORT_PADDING = 8;
const URL_SCHEME = /^[a-z][a-z\d+.-]*:/i;
const UNSAFE_URL_CHARACTERS = /[\u0000-\u001f\u007f\\]/;
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
export const linkDropdownTriggerClassName = 'link-dropdown-trigger';
export const linkDropdownPopupClassName = 'link-dropdown-popup';
export const linkDropdownItemClassName = 'link-dropdown-item';

const triggerClassName = [
  linkDropdownTriggerClassName,
  'relative isolate inline-flex max-w-full min-h-(--abc-buttons-height-sm) items-center justify-center',
  'gap-(--abc-spacing-gap-sm) rounded-(--abc-radius-10) border-0 bg-transparent',
  'py-(--abc-buttons-padding-y-sm) px-(--abc-buttons-padding-x-flush)',
  'text-(--abc-text-default-secondary) text-label-xs text-center no-underline cursor-pointer select-none',
  'transition-colors duration-(--abc-transition-control-duration) ease-(--abc-transition-control-easing)',
  'hover:text-(--abc-surface-brand-brand-1-secondary-hover)',
  'active:text-(--abc-surface-brand-brand-1-secondary-hover)',
  'focus-visible:shadow-[0_0_0_var(--abc-space-4)_var(--abc-surface-default-primary)]',
  'focus-visible:outline-2 focus-visible:outline-offset-(--abc-space-4) focus-visible:outline-(--abc-border-focus)',
  'disabled:text-(--abc-foreground-default-disabled) disabled:cursor-not-allowed',
  'forced-colors:border forced-colors:focus-visible:outline-[Highlight]',
].join(' ');
// The 34ch cap matches the Figma trigger label width; no design token exists for it.
const triggerLabelClassName = 'link-dropdown-trigger-label min-w-0 max-w-[34ch] whitespace-normal';
const popupClassName = cn(
  linkDropdownPopupClassName,
  [
    // The 270px minimum matches the Figma popup width; no design token exists for it.
    'relative box-border w-max min-w-[16.875rem] max-w-[calc(100vw-2*var(--abc-space-8))]',
    'overflow-x-auto border border-(--abc-border-default-secondary) rounded-(--abc-radius-xl)',
    'bg-(--abc-surface-default-primary) py-(--abc-spacing-gap-md) px-(--abc-spacing-inset-md)',
    'text-(--abc-text-default-primary) outline-none origin-(--transform-origin)',
    'shadow-abc-elevation-high-neutral',
    'transition-[opacity,scale,translate] duration-(--abc-transition-control-duration) ease-(--abc-transition-control-easing)',
    'motion-safe:data-starting-style:opacity-0 motion-safe:data-ending-style:opacity-0',
    'motion-safe:data-starting-style:scale-[0.98] motion-safe:data-ending-style:scale-[0.98]',
    'motion-safe:data-[side=bottom]:data-starting-style:translate-y-[calc(-1px*var(--abc-transform-enter-translate-y-from))]',
    'motion-safe:data-[side=bottom]:data-ending-style:translate-y-[calc(-1px*var(--abc-transform-enter-translate-y-from))]',
    'motion-safe:data-[side=top]:data-starting-style:translate-y-[calc(var(--abc-transform-enter-translate-y-from)*1px)]',
    'motion-safe:data-[side=top]:data-ending-style:translate-y-[calc(var(--abc-transform-enter-translate-y-from)*1px)]',
  ].join(' ')
);
const listClassName = 'link-dropdown-list grid min-w-max m-0 p-0 gap-0 list-none';
const itemClassName = cn(
  linkDropdownItemClassName,
  [
    'group/link-dropdown-item relative isolate flex w-full min-w-max items-center overflow-clip',
    'rounded-(--abc-radius-lg) bg-(--abc-surface-default-primary) text-(--abc-text-default-primary)',
    'no-underline whitespace-nowrap transition-[color,background-color]',
    'duration-(--abc-transition-control-duration) ease-(--abc-transition-control-easing)',
    'hover:bg-(--abc-surface-default-primary-hover) focus-visible:z-10',
    'focus-visible:shadow-[0_0_0_var(--abc-space-4)_var(--abc-surface-default-primary)]',
    'focus-visible:outline-2 focus-visible:outline-offset-(--abc-space-4) focus-visible:outline-(--abc-border-focus)',
    'forced-colors:focus-visible:outline-[Highlight]',
  ].join(' ')
);
const itemContentClassName = [
  'link-dropdown-item-content flex flex-1 items-center min-w-0 overflow-clip',
  'rounded-(--abc-radius-sm) bg-(--abc-surface-default-primary)',
  'py-(--abc-spacing-inset-sm) ps-(--abc-space-8) pe-(--abc-spacing-inset-sm) text-body-sm',
  'transition-[color,background-color] duration-(--abc-transition-control-duration) ease-(--abc-transition-control-easing)',
  'group-hover/link-dropdown-item:bg-(--abc-surface-default-primary-hover)',
  'group-focus-visible/link-dropdown-item:bg-(--abc-surface-default-primary)',
].join(' ');

function isSlotItem(item: LinkDropdownItem): item is LinkDropdownSlotItem {
  return item.link !== undefined;
}

function getSafeHref(value: string) {
  if (!value || value.trim() !== value || UNSAFE_URL_CHARACTERS.test(value)) return null;
  if (value.startsWith('//')) return null;

  try {
    const parsed = new URL(value, 'https://relative.invalid');
    const isAbsolute = URL_SCHEME.test(value);
    if (isAbsolute && !SAFE_LINK_PROTOCOLS.has(parsed.protocol)) return null;
    if (!isAbsolute && parsed.origin !== 'https://relative.invalid') return null;
    return value;
  } catch {
    return null;
  }
}

function getLinkTarget(href: string, target?: LinkDropdownHrefItem['target']) {
  return /^https?:/i.test(href) && target === '_blank' ? '_blank' : undefined;
}

function getSecureRel(target?: string, rel?: string) {
  const values = new Set(rel?.split(/\s+/).filter(Boolean));
  if (target === '_blank') {
    values.add('noopener');
    values.add('noreferrer');
  }
  return values.size ? [...values].join(' ') : undefined;
}

function isRenderableItem(item: LinkDropdownItem) {
  return isSlotItem(item) || getSafeHref(item.href) !== null;
}

function ItemContent({ children }: { children: ReactNode }) {
  return <span className={itemContentClassName}>{children}</span>;
}

function HrefItem({ item, onNavigate }: { item: LinkDropdownHrefItem; onNavigate: () => void }) {
  const href = getSafeHref(item.href);
  if (!href) return null;

  const target = getLinkTarget(href, item.target);

  return (
    <a
      className={itemClassName}
      href={href}
      rel={getSecureRel(target, item.rel)}
      target={target}
      onClick={onNavigate}
    >
      <ItemContent>{item.label}</ItemContent>
    </a>
  );
}

function SlotItem({ item, onNavigate }: { item: LinkDropdownSlotItem; onNavigate: () => void }) {
  const providerOnClick = item.link.props.onClick;
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    providerOnClick?.(event);
    onNavigate();
  };

  return cloneElement(
    item.link,
    {
      className: cn(item.link.props.className, itemClassName),
      onClick: handleClick,
      rel: getSecureRel(item.link.props.target, item.link.props.rel),
    },
    <ItemContent>{item.label}</ItemContent>
  );
}

export function LinkDropdownList({
  items,
  navigationLabel,
  onNavigate,
}: {
  items: readonly LinkDropdownItem[];
  navigationLabel: string;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label={navigationLabel} className="link-dropdown-navigation">
      <ul className={listClassName}>
        {items.map((item) => (
          <li className="link-dropdown-list-item" key={item.id}>
            {isSlotItem(item) ? (
              <SlotItem item={item} onNavigate={onNavigate} />
            ) : (
              <HrefItem item={item} onNavigate={onNavigate} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function LinkDropdown({
  id,
  className,
  defaultOpen = false,
  disabled = false,
  items,
  navigationLabel = 'Hidden breadcrumb pages',
  triggerLabel,
  trigger,
}: LinkDropdownProps) {
  const renderableItems = items.filter(isRenderableItem);
  const hasItems = renderableItems.length > 0;
  const [open, setOpen] = useState(defaultOpen && hasItems && !disabled);
  const actionsRef = useRef<PopoverActions>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const suppressRestoredFocusOpen = useRef(false);
  const handleTriggerFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
    if (suppressRestoredFocusOpen.current) {
      suppressRestoredFocusOpen.current = false;
      return;
    }
    if (event.currentTarget.matches(':focus-visible')) setOpen(true);
  };

  return (
    <span id={id} className={cn('link-dropdown inline-flex', className)}>
      <Popover
        actionsRef={actionsRef}
        open={open && !disabled}
        onOpenChange={(nextOpen, eventDetails) => {
          suppressRestoredFocusOpen.current =
            !nextOpen &&
            ['escape-key', 'imperative-action'].includes(eventDetails.reason) &&
            document.activeElement !== triggerRef.current;
          setOpen(nextOpen);
        }}
      >
        <PopoverTrigger
          render={trigger}
          ref={triggerRef}
          aria-label={triggerLabel}
          className={trigger ? undefined : triggerClassName}
          delay={0}
          disabled={!hasItems || disabled}
          onFocus={trigger ? undefined : handleTriggerFocus}
          openOnHover={!trigger}
          type="button"
        >
          {trigger?.props.children ?? (
            <span data-slot="button-label" className={triggerLabelClassName}>
              <span aria-hidden="true">...</span>
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          aria-label={navigationLabel}
          className={popupClassName}
          collisionAvoidance={{ side: 'flip', align: 'shift' }}
          collisionPadding={VIEWPORT_PADDING}
          initialFocus={false}
          side="bottom"
          sideOffset={POSITION_GAP}
          unstyled
        >
          <LinkDropdownList
            items={renderableItems}
            navigationLabel={navigationLabel}
            onNavigate={() => actionsRef.current?.close()}
          />
        </PopoverContent>
      </Popover>
    </span>
  );
}
