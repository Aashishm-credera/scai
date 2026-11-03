import type { ButtonHTMLAttributes, Ref } from 'react';
import type { ButtonVariant } from './button-variants';

export interface ButtonActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: string;
  styles?: string;
  ref?: Ref<HTMLButtonElement>;
}
