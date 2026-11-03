/**
 * Tailwind v4 emits an `@utility` rule only when its scanner finds the class name written out
 * in full, so a composed `text-${role}-${size}` yields a class that never reaches the stylesheet.
 *The sample silently renders at the inherited size. Spelling each one out is what makes the
 * real utility reachable, so these pages demo exactly what a component would render.
 *
 * typography-classes.test.ts asserts this stays in step with the generated token module.
 */
export const typographyClasses = {
  display: {
    xs: 'text-display-xs',
    sm: 'text-display-sm',
    md: 'text-display-md',
    lg: 'text-display-lg',
    xl: 'text-display-xl',
    '2xl': 'text-display-2xl',
  },
  heading: {
    xs: 'text-heading-xs',
    sm: 'text-heading-sm',
    md: 'text-heading-md',
    lg: 'text-heading-lg',
    xl: 'text-heading-xl',
    '2xl': 'text-heading-2xl',
  },
  body: {
    xs: 'text-body-xs',
    sm: 'text-body-sm',
    md: 'text-body-md',
    lg: 'text-body-lg',
    xl: 'text-body-xl',
    '2xl': 'text-body-2xl',
    '3xl': 'text-body-3xl',
  },
  label: {
    xs: 'text-label-xs',
    sm: 'text-label-sm',
    md: 'text-label-md',
    lg: 'text-label-lg',
  },
} as const satisfies Record<string, Record<string, string>>;

export function typographyClass(role: string, size: string): string | undefined {
  const roleClasses: Record<string, string> | undefined =
    typographyClasses[role as keyof typeof typographyClasses];
  return roleClasses?.[size];
}
