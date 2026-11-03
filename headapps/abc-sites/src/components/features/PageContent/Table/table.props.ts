import type { Item, RichTextField, TextField } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';


export interface LabelFields {
  Text: { value: string };
  Icon: CompatibleField<Item>;
  Color: { value: string };
}

export interface RowCellFields {
  id: string,
  Label?: { targetItem?: CompatibleDatasource<LabelFields> };
  Text?: CompatibleField<TextField>;
  LabelText?: CompatibleField<TextField>;
  LabelColor?: { value: string };
  LabelIcon?: CompatibleField<Item>;
}

export interface RowFields {
  id: string;
  RowCells?: { results?: Array<RowCellFields | null> | null } | null
}

export interface TableFields {
  Title?: CompatibleField<TextField>;
  Description?: CompatibleField<RichTextField>;
  TableRows?: { results?: Array<RowFields | null> | null } | null;
}

export interface TableProps extends ComponentProps {
  fields?: CompatibleDatasource<TableFields>;
}
