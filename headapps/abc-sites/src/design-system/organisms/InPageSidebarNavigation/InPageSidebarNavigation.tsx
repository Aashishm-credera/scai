'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ButtonAction } from '@/design-system/atoms/BaseButton';
import { abcIcon } from '@/design-system/design/icons';
import { cn } from '@/design-system/lib/cn';
import type { InPageSidebarNavigationProps } from './in-page-sidebar-navigation.props';

/** Presentational sidebar; section discovery and CMS fields belong to the rendering. */
export function InPageSidebarNavigation({
  title,
  titleId,
  closeLabel = 'Close',
  items,
  activeItemId,
  isEditing = false,
  className,
  ...props
}: InPageSidebarNavigationProps) {
  const generatedId = useId();
  const headingId = titleId ?? `${generatedId}-title`;
  const listId = `${generatedId}-links`;
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const restoreToggleFocus = useRef(false);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const currentItemId = activeItemId ?? selectedItemId;
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === currentItemId)
  );
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (isOpen && window.matchMedia('(width < 1024px)').matches) {
      listRef.current?.querySelector('a')?.focus({ preventScroll: true });
    } else if (restoreToggleFocus.current) {
      toggleRef.current?.focus({ preventScroll: true });
      restoreToggleFocus.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isEditing) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        window.matchMedia('(width < 1024px)').matches &&
        event.target instanceof Node &&
        listRef.current?.parentElement?.contains(event.target)
      ) {
        event.preventDefault();
        restoreToggleFocus.current = true;
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isEditing]);

  const closeNavigation = () => {
    restoreToggleFocus.current = true;
    setIsOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <nav
      {...props}
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        'flex min-w-0 flex-col bg-linear-to-b from-abc-surface-default-primary from-65% to-neutral-50 to-90% p-2.5 shadow-abc-elevation-high-neutral lg:rounded-[19px] lg:p-2.75 xl:rounded-[20px] xl:p-3',
        !isEditing && isOpen
          ? 'mx-auto max-w-78 rounded-lg md:rounded-[10px] lg:mx-0 lg:max-w-none'
          : 'rounded-2xl md:rounded-[17px]',
        !isEditing &&
          'fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 max-h-[calc(100dvh-2rem)] overflow-hidden lg:sticky lg:inset-x-auto lg:top-6 lg:bottom-auto lg:z-auto lg:max-h-[calc(100dvh-3rem)] lg:w-full lg:overflow-y-auto',
        className
      )}
    >
      {title && (
        <p
          id={isEditing ? headingId : undefined}
          className={cn(
            'm-0 shrink-0 border-b border-abc-border-default-secondary p-3.25 text-label-sm text-abc-text-default-secondary uppercase md:p-3.5 lg:p-3.75 xl:p-4',
            !isEditing && !isOpen && 'hidden lg:block'
          )}
        >
          {title}
        </p>
      )}
      {!isEditing && (
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full min-w-0 shrink-0 cursor-pointer flex-col gap-3 rounded-lg p-3.25 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-abc-border-focus md:p-3.5 lg:hidden',
            isOpen ? 'hidden' : 'flex'
          )}
        >
          {title && (
            <span className="text-label-sm text-abc-text-default-secondary uppercase">{title}</span>
          )}
          <span className="flex w-full min-w-0 items-center gap-3.25">
            <span
              aria-hidden="true"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-abc-surface-brand-brand-2 text-label-sm text-abc-text-inverse-primary"
            >
              {currentIndex + 1}
            </span>
            <span className="min-w-0 flex-1 text-heading-xs wrap-anywhere text-abc-text-default-primary">
              {currentItem.label}
            </span>
            <abcIcon
              name="interface/arrows/chevron-down"
              size="md"
              aria-hidden
              className={cn(isOpen && 'rotate-180')}
            />
          </span>
        </button>
      )}
      {/* A single responsive label keeps the landmark named when either heading is hidden. */}
      {title && !isEditing && (
        <span id={headingId} className="sr-only">
          {title}
        </span>
      )}
      <ol
        ref={listRef}
        id={listId}
        className={cn(
          'm-0 min-h-0 list-none flex-col py-2.5 pl-0 lg:flex lg:py-2.75 xl:py-3',
          !isEditing && 'overflow-y-auto overscroll-contain lg:overflow-visible',
          isEditing || isOpen ? 'flex' : 'hidden'
        )}
      >
        {items.map((item, index) => {
          const isActive = item.id === currentItemId;

          return (
            <li key={item.id} className="min-w-0">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => {
                  setSelectedItemId(item.id);
                  setIsOpen(false);
                }}
                className="group flex min-w-0 items-center gap-3.25 rounded-lg px-2.5 py-3.25 text-abc-text-default-quaternary no-underline hover:bg-abc-surface-default-secondary hover:text-abc-text-default-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-abc-border-focus md:gap-3.5 md:py-3.5 lg:gap-3.75 lg:px-2.75 lg:py-3.75 xl:gap-4 xl:px-3 xl:py-4"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-flex size-6 shrink-0 items-center justify-center rounded-full text-label-sm',
                    isActive
                      ? 'bg-abc-surface-brand-brand-2 text-abc-text-inverse-primary'
                      : 'bg-abc-surface-default-secondary text-abc-text-default-quaternary'
                  )}
                >
                  {index + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 wrap-anywhere">
                  <span className={isActive ? 'text-abc-text-default-primary text-heading-xs ' : 'text-abc-text-default-quaternary text-heading-xs '}>{item.label}</span>
                  {item.subText && (
                    <span className="text-body-sm text-abc-text-default-secondary">
                      {item.subText}
                    </span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      {!isEditing && isOpen && (
        <div className="flex shrink-0 justify-center pt-2.5 pb-1 lg:hidden">
          <ButtonAction variant="secondary" onClick={closeNavigation}>
            {closeLabel}
          </ButtonAction>
        </div>
      )}
    </nav>
  );
}
