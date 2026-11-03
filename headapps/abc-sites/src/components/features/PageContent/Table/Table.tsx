import type { JSX } from 'react';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import {
  hasUnsafeDescriptionLink,
  isDescriptionEmpty,
  sanitizeDescriptionHtml,
} from '@/components/foundation/rich-text/description-field';
import { getIconName } from '@/components/foundation/icon/icon-field';
import { Table as TableFE } from '@/design-system/molecules/Table/Table';
import type { RowCellFields, TableFields, TableProps } from './table.props';
import type {
  LabelItemField,
  LabelTextField,
  Row,
  RowCell,
  TableProps as TableUIComponentProps,
} from '@/design-system/molecules/Table/table.props';

/**
 * Prioritize a configured label over text. In Page Builder, retain an empty text
 * field so authors can still select and edit the cell.
 */
const getRowCellField = (
  cell: RowCellFields | null | undefined,
  isEditing = false
): LabelTextField | LabelItemField | TextField | undefined => {
  // Label fields from Table Cell Item
  const labelTextField = getFieldValue(cell?.LabelText);
  const labelTextFieldValue = (labelTextField?.value as string);
  const labelColor = getFieldValue(cell?.LabelColor)?.value ?? 'neutral'
  const labelIcon = getIconName(getFieldValue(cell?.LabelIcon));

  // Check if label text and label color is set
  if (labelTextField && labelTextFieldValue.trim().length > 0){
    return {
      textField: labelTextField,
      color: labelColor.replace(/^(foreground|surface)-/, ''),
      icon: labelIcon,
    };
  }

  const labelItem = getDatasource(cell?.Label?.targetItem);

  // Check if Label field is set
  if (labelItem) {
    const color = getFieldValue(labelItem.Color)?.value ?? '';

    return {
      text: getFieldValue(labelItem.Text)?.value ?? '',
      color: color.replace(/^(foreground|surface)-/, ''),
      icon: getIconName(getFieldValue(labelItem.Icon)),
    };
  }

  // Default to Text field
  const textField = getFieldValue(cell?.Text);
  const textValue = typeof textField?.value === 'string' ? textField.value : undefined;

  return isEditing || !isDescriptionEmpty(textValue) ? textField : undefined;
};

/**
 * Map Sitecore's datasource fields to the table UI props.
 */
const mapTableDataToUIComponentProps = (
  datasource: TableFields,
  styles: string | undefined,
  isEditing = false
): TableUIComponentProps => {
  const titleField = getFieldValue(datasource.Title);

  const description = getFieldValue(datasource.Description);
  const descriptionValue = description?.value;
  const descriptionField = isEditing
    ? description
    : !isDescriptionEmpty(descriptionValue) && !hasUnsafeDescriptionLink(descriptionValue)
      ? { ...description, value: sanitizeDescriptionHtml(descriptionValue) }
      : undefined;

  let totalColumns = 0;
  const tableRows = getFieldValue(datasource.TableRows)?.results?.map((row): Row => {
    const rowCells = getFieldValue(row?.RowCells)?.results?.map((cell): RowCell => {
      const hasLabelTextFieldValue = Boolean((getFieldValue(cell?.LabelText)?.value as string).trim().length > 0);
      const hasLabelItem = Boolean(getDatasource(cell?.Label?.targetItem));

      return {
        id: cell?.id,
        fieldType: hasLabelTextFieldValue ? 'LabelTextField' : hasLabelItem ? 'LabelItemField' : 'TextField',
        field: getRowCellField(cell, isEditing),
      };
    });

    totalColumns = Math.max(totalColumns, rowCells?.length ?? 0);

    return {
      id: row?.id,
      rowCells,
    };
  });

  return {
    titleField,
    descriptionField,
    tableRows,
    totalRows: tableRows?.length ?? 0,
    totalColumns,
    styles,
    isEditing,
  };
};

export const Default = ({ fields, params, page }: TableProps): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? <span className="is-empty-hint">Missing Table Datasource</span> : null;
  }

  const tableUIProps = mapTableDataToUIComponentProps(datasource, params.styles, isEditing);

  return (
    <>
      <TableFE {...tableUIProps} renderingId={params.RenderingIdentifier || undefined} />
      {isEditing && tableUIProps?.tableRows?.length === 0 && (
        <span className="is-empty-hint">Add a Table Row children to this datasource</span>
      )}
    </>
  );
};
