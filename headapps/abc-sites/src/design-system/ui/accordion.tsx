'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { cn } from '@/design-system/lib/cn';

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('not-last:border-b', className)}
      {...props}
    />
  );
}

type AccordionTriggerProps = AccordionPrimitive.Trigger.Props & {
  /** The heading level that wraps the trigger button; pick it from the page hierarchy. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  headerClassName?: string;
};

function AccordionTrigger({
  className,
  headerClassName,
  headingLevel = 3,
  children,
  ...props
}: AccordionTriggerProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      render={<Heading />}
      className={cn('m-0 flex', headerClassName)}
    >
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex flex-1 items-start justify-between text-left outline-none aria-disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden transition-[height] data-starting-style:h-0 data-ending-style:h-0',
        className
      )}
      {...props}
    />
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
