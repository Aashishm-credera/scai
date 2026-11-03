import type { ComponentProps } from 'react';
import { cn } from '@/design-system/lib/cn';

/**
 * The outermost layout block. Centers content, caps the content at 1280px, and applies the
 * responsive page margin outside that cap. All three values come from Figma's layout tokens
 * (`--abc-layout-container-*` in src/design-system/tokens/generated/semantic.css), so they resize at the same
 * breakpoints (480/1024/1600px) as everything else, with no @media queries written here.
 */
export function BaseContainer({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        // The cap is 1280px of CONTENT, with the page margins outside it (Figma: "this span
        // is separate from the container cap"). With border-box sizing a plain max-w-1280
        // would include the margins, leaving 1088px of content at 1600px instead of 1280px.
        'mx-auto w-full max-w-[calc(var(--abc-layout-container-max-width)+2*var(--abc-layout-container-page-margin-inline))] px-abc-layout-container-page-margin-inline',
        className
      )}
      {...props}
    />
  );
}
