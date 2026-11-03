import type { RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
export interface LabelTextField {
  textField: TextField;
  color: string;
  icon?: string | undefined;
}

export interface LabelItemField {
  text: string;
  color: string;
  icon?: string | undefined;
}

export interface RowCell {
  id: string | undefined;
  fieldType: 'LabelItemField' | 'LabelTextField'| 'TextField';
  field: LabelItemField | TextField | LabelTextField | undefined;
}

export interface Row {
  id: string | undefined;
  rowCells: Array<RowCell> | undefined;
}

export interface TableProps {
  titleField?: TextField | undefined;
  descriptionField?: RichTextField | undefined;
  tableRows?: Array<Row> | undefined;
  totalRows: number;
  totalColumns: number;
  isEditing: boolean;
  styles?: string;
  renderingId?: string;
}
