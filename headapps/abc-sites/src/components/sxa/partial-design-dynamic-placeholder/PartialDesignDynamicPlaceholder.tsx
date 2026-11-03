import React, { JSX } from 'react';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import { PartialDesignDynamicPlaceholderProps } from './partial-design-dynamic-placeholder.props';

const PartialDesignDynamicPlaceholder = (
  props: PartialDesignDynamicPlaceholderProps
): JSX.Element => {
  return (
    <AppPlaceholder
      name={props.rendering?.params?.sig || ''}
      rendering={props.rendering}
      page={props.page}
      componentMap={props.componentMap}
    />
  );
};

export default PartialDesignDynamicPlaceholder;
