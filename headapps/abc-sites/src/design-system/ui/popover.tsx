'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '@/design-system/lib/cn';

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'collisionAvoidance' | 'collisionPadding' | 'side' | 'sideOffset'
  > & {
    positionerClassName?: string;
    unstyled?: boolean;
  };

const popoverContentClassName =
  'z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2';

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  align = 'center',
  alignOffset = 0,
  children,
  className,
  collisionAvoidance,
  collisionPadding,
  positionerClassName,
  side = 'bottom',
  sideOffset = 4,
  unstyled = false,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        collisionAvoidance={collisionAvoidance}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        className={cn('z-50', positionerClassName)}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(!unstyled && popoverContentClassName, className)}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
export type PopoverActions = PopoverPrimitive.Root.Actions;
