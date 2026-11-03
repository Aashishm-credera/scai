import { ComponentRendering } from '@sitecore-content-sdk/nextjs';
import { ComponentProps, PlaceholderComponentProps } from 'lib/component-props';

export type RowNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type RowStyles = {
  [K in `Styles${RowNumber}`]?: string;
};

export interface RowSplitterProps extends PlaceholderComponentProps {
  rendering: ComponentRendering;
  params: ComponentProps['params'] & RowStyles;
}
