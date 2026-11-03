import type { Field } from '@sitecore-content-sdk/nextjs';
import type { CompatibleField } from 'lib/component-props';

/** Fields from the `_Tooltip` base template (Foundation/abc/Common). */
export interface TooltipFields {
  TooltipTitle?: CompatibleField<Field<string>>;
  TooltipText?: CompatibleField<Field<string>>;
}
