import { cn } from '@/design-system/lib/cn';
import type { ContentSectionProps } from './content-section.props';

/** Presentational section; the rendering supplies editable fields and placeholder content. */
export function ContentSection({
  heading,
  headingNumber,
  description,
  children,
  className,
  ...props
}: ContentSectionProps) {
  return (
    <>
      <section
        {...props}
        className={cn(
          'flex w-full min-w-0 flex-col gap-6.5 last-of-type:pb-10 md:gap-7 lg:gap-7.5 xl:gap-8',
          className
        )}
      >
        {(heading || description) && (
          <div className="flex w-full min-w-0 flex-col items-start gap-(--abc-spacing-gap-xl)">
            {heading && (
              <div className="flex w-full min-w-0 items-start gap-4">
                {headingNumber !== undefined && (
                  <span
                    aria-hidden="true"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-abc-surface-default-secondary text-sm font-bold text-abc-text-default-secondary md:size-8.5 md:text-base lg:size-9 lg:text-lg xl:size-10 xl:text-xl"
                  >
                    {headingNumber}
                  </span>
                )}
                {heading}
              </div>
            )}
            {description}
          </div>
        )}
        {children}
      </section>
      <hr className="my-(--abc-spacing-gap-9xl) w-full border-0 border-t border-(--abc-border-default-primary) last:hidden" />
    </>
  );
}
