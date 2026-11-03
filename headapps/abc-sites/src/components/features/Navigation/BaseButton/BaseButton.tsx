import { JSX } from 'react';
import { Button, type ButtonProps } from '@/design-system/atoms/BaseButton';
import { getIconName } from '@/components/foundation/icon/icon-field';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { BaseButtonProps } from './base-button.props';

const EMPTY_LINK_PLACEHOLDER = '[Add button link]';

const renderButton = (
  { fields, params, page }: BaseButtonProps,
  variant: ButtonProps['variant']
): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);
  const emptyHint = isEditing ? (
    <span className="is-empty-hint">Missing Button Datasource</span>
  ) : null;

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return emptyHint;
  }

  return (
    <Button
      variant={variant}
      linkField={getFieldValue(datasource.Link)}
      icon={getIconName(getFieldValue(datasource.Icon))}
      // The Button Icon Position style (`button-icon-right`) arrives with the rendering styles.
      styles={params.styles ?? ''}
      // A new button has an empty link: Page Builder still shows the design so it can be filled in.
      editingPlaceholder={isEditing ? EMPTY_LINK_PLACEHOLDER : undefined}
    />
  );
};

export const Default = (props: BaseButtonProps): JSX.Element | null =>
  renderButton(props, 'primary');

export const Secondary = (props: BaseButtonProps): JSX.Element | null =>
  renderButton(props, 'secondary');

export const Tertiary = (props: BaseButtonProps): JSX.Element | null =>
  renderButton(props, 'tertiary');

export const Link = (props: BaseButtonProps): JSX.Element | null => renderButton(props, 'link');
