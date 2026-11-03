import type { ComponentProps, ReactNode } from 'react';

export interface ContentSectionProps extends ComponentProps<'section'> {
  heading?: ReactNode;
  headingNumber?: number;
  description?: ReactNode;
}
