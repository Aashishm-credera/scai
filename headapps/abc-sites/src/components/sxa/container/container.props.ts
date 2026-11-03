import { ComponentProps, PlaceholderComponentProps } from 'lib/component-props';

export interface ContainerProps extends PlaceholderComponentProps {
  params: ComponentProps['params'] & {
    BackgroundImage?: string;
    DynamicPlaceholderId: string;
  };
}
