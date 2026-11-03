import type { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { DescriptionText } from '@/design-system/atoms/DescriptionText';
import { SubHeadingText } from '@/design-system/atoms/SubHeadingText';
import { abcIcon } from '@/design-system/design/icons';
import { cn } from '@/design-system/lib/cn';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/design-system/ui/accordion';
import { AccordionRoot } from './AccordionRoot';
import type { AccordionProps } from './accordion.props';

const transitionClassName =
  'duration-(--abc-transition-control-duration) ease-(--abc-transition-control-easing)';

// Transition A: hovering or pressing anywhere on the trigger tints the whole item. Figma gives
// pressed and open-hover no fill of their own, so both keep the hover fill.
const itemClassName = cn(
  'relative min-h-(--abc-size-lg) scroll-mt-(--abc-spacing-inset-xl) rounded-(--abc-radius-lg)',
  'bg-(--abc-surface-default-primary) transition-colors',
  // A border would curve with the rounded corners; the divider stays a straight line.
  'not-last:border-b-0 not-last:after:absolute not-last:after:inset-x-0 not-last:after:bottom-0',
  'not-last:after:h-px not-last:after:bg-(--abc-border-default-secondary)',
  transitionClassName,
  'has-[[data-slot=accordion-trigger]:hover]:bg-(--abc-surface-default-primary-hover)',
  'has-[[data-slot=accordion-trigger]:active]:bg-(--abc-surface-default-primary-hover)',
  'data-open:bg-(--abc-surface-default-primary-hover)',
  // The ring wraps the whole item, 2px outside it, and is raised above the next item's fill.
  'has-[[data-slot=accordion-trigger]:focus-visible]:z-10',
  'has-[[data-slot=accordion-trigger]:focus-visible]:outline-2',
  'has-[[data-slot=accordion-trigger]:focus-visible]:outline-solid',
  'has-[[data-slot=accordion-trigger]:focus-visible]:outline-offset-(--abc-space-2)',
  'has-[[data-slot=accordion-trigger]:focus-visible]:outline-(--abc-border-focus)',
  // The ring curves inside the item's corners, so the straight dividers on either side of it
  // would cut through. The ring already separates the item.
  'has-[[data-slot=accordion-trigger]:focus-visible]:after:hidden',
  'has-[+[data-slot=accordion-item]_[data-slot=accordion-trigger]:focus-visible]:after:hidden',
  'forced-colors:has-[[data-slot=accordion-trigger]:focus-visible]:outline-[Highlight]'
);

const triggerClassName = cn(
  'w-full cursor-pointer gap-(--abc-spacing-gap-md) rounded-(--abc-radius-lg) border-0 bg-transparent',
  'px-(--abc-spacing-inset-md) py-(--abc-spacing-inset-lg) text-(--abc-text-default-tertiary)',
  'aria-expanded:pb-0 aria-expanded:text-(--abc-text-default-primary) transition-[padding,color]',
  transitionClassName
);

// The answer spans the item's full inner width, under the icon too.
const answerClassName =
  'px-(--abc-spacing-inset-md) pt-(--abc-spacing-gap-sm) pb-(--abc-spacing-inset-lg)';

export function Accordion({
  id,
  className,
  title,
  items,
  isEditing = false,
}: AccordionProps): JSX.Element | null {
  if (!isEditing && items.length === 0) return null;

  // The title is the h3 (#240392); the questions sit one level below it.
  const hasTitle = Boolean(title && (isEditing || title.value?.trim()));
  const headingLevel = hasTitle ? 4 : 3;

  return (
    <div
      id={id}
      className={cn(
        'component accordion w-full min-w-0 max-w-[485px] md:max-w-[756px] lg:max-w-[924px]',
        className
      )}
    >
      {hasTitle && <SubHeadingText SubHeadingField={title} isEditing={isEditing} />}
      <AccordionRoot anchors={items.map((item) => item.anchor)} isEditing={isEditing}>
        {items.map((item) => (
          <AccordionItem
            key={item.anchor}
            id={item.anchor}
            value={item.anchor}
            className={itemClassName}
          >
            {/* Base UI only sets aria-controls while open; the panel is always in the DOM, so
                reference it in both states. */}
            <AccordionTrigger
              headingLevel={headingLevel}
              aria-controls={`${item.anchor}-answer`}
              className={triggerClassName}
            >
              <Text
                field={item.question}
                tag="span"
                className="min-w-0 flex-1 text-heading-xs wrap-anywhere text-pretty"
              />
              {/* One question line tall, so the icon centres on the first line when it wraps. */}
              <span className="flex h-[1lh] shrink-0 items-center text-heading-xs text-(--abc-foreground-default-tertiary) group-aria-expanded/accordion-trigger:text-(--abc-foreground-default-secondary)">
                <abcIcon
                  name="interface/general/plus"
                  size="md"
                  aria-hidden="true"
                  className="group-aria-expanded/accordion-trigger:hidden"
                />
                <abcIcon
                  name="interface/general/minus"
                  size="md"
                  aria-hidden="true"
                  className="hidden group-aria-expanded/accordion-trigger:inline-flex"
                />
              </span>
            </AccordionTrigger>
            {/* Closed answers stay in the DOM for find-in-page and search, but are hidden, so
                their links never take keyboard focus. */}
            <AccordionContent
              id={`${item.anchor}-answer`}
              hiddenUntilFound={!isEditing}
              className={cn('transition-[height]', transitionClassName)}
            >
              <div className={answerClassName}>
                <DescriptionText DescriptionField={item.answer} size="s" isEditing={isEditing} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionRoot>
    </div>
  );
}
