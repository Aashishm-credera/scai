'use client';

import { useId, useRef, useState, type ReactElement } from 'react';
import { Tooltip as TooltipRoot, TooltipContent, TooltipTrigger } from '@/design-system/ui/tooltip';

/**
 * A short, non-interactive label for a trigger, per the Figma Tooltip component. Built on the
 * shadcn tooltip in ui/, restyled to Figma.
 *
 * Behaviour follows the Figma interaction notes:
 * - opens on pointer hover or keyboard focus, and stays open while the pointer is over the
 *   trigger or the tooltip itself (WCAG 1.4.13, content on hover or focus);
 * - Escape closes it without moving focus;
 * - no auto-dismiss timeout.
 *
 * Touch is the one addition. The underlying Base UI tooltip is disabled on touch devices, since
 * nothing can be hovered, so a tap on the trigger toggles it instead.
 *
 * Content must stay non-interactive: no links or buttons. Figma directs anything interactive to a
 * popover or dialog instead.
 */
export type BaseTooltipProps = {
  title: string;
  supportingText?: string;
  /** The trigger. Must be focusable and have its own accessible name, e.g. an icon button. */
  children: ReactElement;
};

export function BaseTooltip({ title, supportingText, children }: BaseTooltipProps) {
  const [open, setOpen] = useState(false);
  const pointerType = useRef('');
  const descriptionId = useId();

  return (
    <TooltipRoot open={open} onOpenChange={setOpen}>
      {/*
        delay={0} matches shadcn's default. shadcn sets it on TooltipProvider, which this atom
        does not use, so without it Base UI's own ~600ms hover delay applied by accident.
        cursor-pointer because Tailwind v4 gives buttons the default arrow cursor.
      */}
      <TooltipTrigger
        render={children}
        delay={0}
        className="cursor-pointer"
        closeOnClick={false}
        aria-describedby={descriptionId}
        onPointerDown={(event) => {
          pointerType.current = event.pointerType;
        }}
        onClick={() => {
          if (pointerType.current === 'touch') setOpen((isOpen) => !isOpen);
        }}
      />

      {/*
        Always in the DOM, so screen readers get the text as the trigger's description whether or
        not the visual tooltip is open. On touch, VoiceOver and TalkBack users may never open it.
      */}
      <span id={descriptionId} className="sr-only">
        {supportingText ? `${title}. ${supportingText}` : title}
      </span>

      {/*
        sideOffset is the trigger gap, 8px (--abc-spacing-gap-sm at desktop); it takes a number,
        not a CSS variable. `*:data-side:hidden` hides shadcn's arrow, which Figma does not have.

        Radius and padding are written `rounded-(--token)`, not `rounded-abc-radius-md`, on
        purpose. `cn` only drops shadcn's `rounded-md px-3 py-1.5` when it recognises ours as the
        same property, and it does not know our named theme utilities. With the named form both
        classes stay on the element and stylesheet order picks one; shadcn's radius was winning.
      */}
      <TooltipContent
        sideOffset={8}
        aria-hidden="true"
        className="max-w-[min(500px,calc(100vw-2*var(--abc-layout-container-page-margin-inline)))] flex-col items-start gap-0 rounded-(--abc-radius-md) bg-(--abc-color-neutral-950) px-(--abc-spacing-inset-md) py-(--abc-spacing-inset-sm) shadow-abc-lg *:data-side:hidden"
      >
        <p className="text-body-sm text-pretty text-abc-text-inverse-primary">{title}</p>
        {supportingText && (
          <p className="text-body-xs text-pretty text-abc-text-inverse-secondary">
            {supportingText}
          </p>
        )}
      </TooltipContent>
    </TooltipRoot>
  );
}
