import { useId, type JSX } from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { isLabelVariant, Label } from '@/design-system/atoms/Label';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/ui/table';
import { cn } from '@/design-system/lib/cn';
import type { LabelItemField, LabelTextField, RowCell, TableProps } from './table.props';

const isLabelTextField = (field: RowCell['field']): field is LabelTextField =>
  typeof field === 'object' && field !== null && 'textField' in field && 'color' in field;

const MIN_COLUMN_WIDTH = 160;

const isLabelItemField = (field: RowCell['field']): field is LabelItemField =>
  typeof field === 'object' && field !== null && 'text' in field && 'color' in field;

const renderRowCell = (cell: RowCell | undefined): JSX.Element | null => {
  if (!cell?.field) return null;

  if (cell.fieldType === 'LabelTextField' && isLabelTextField(cell.field)) {
    return (
      <Label
        icon={cell.field.icon}
        iconPosition={cell.field.icon ? 'left' : 'none'}
        variant={isLabelVariant(cell.field.color) ? cell.field.color : 'neutral'}
      >
        <Text field={cell.field.textField}/>
      </Label>
    );
  }

  if (cell.fieldType === 'LabelItemField' && isLabelItemField(cell.field)) {
    return (
      <Label
        className="max-w-none whitespace-nowrap text-center [&>span]:whitespace-nowrap [&>span]:font-(family-name:--abc-font-family-body) [&>span]:text-(length:--abc-font-size-text-sm) [&>span]:leading-(--abc-font-line-height-text-sm) [&>span]:font-medium"
        icon={cell.field.icon}
        iconPosition={cell.field.icon ? 'left' : 'none'}
        variant={isLabelVariant(cell.field.color) ? cell.field.color : 'neutral'}
      >
        {cell.field.text}
      </Label>
    );
  }

  if (cell.fieldType === 'TextField' && !isLabelItemField(cell.field) && !isLabelTextField(cell.field)) {
    return <Text field={cell.field} />;
  }
  
  return null;
};

export function Table({
  titleField,
  descriptionField,
  tableRows,
  totalColumns,
  styles,
  renderingId,
  isEditing,
}: TableProps): JSX.Element {
  const tableId = useId();
  const headerRow = tableRows?.[0];
  const bodyRows = tableRows?.slice(1) ?? [];
  const columns = Array.from({ length: totalColumns }, (_, index) => index);
  const titleId = `${tableId}-title`;
  const descriptionId = `${tableId}-description`;
  const titleText = typeof titleField?.value === 'string' ? titleField.value : undefined;
  const minTableWidth = totalColumns * MIN_COLUMN_WIDTH;

  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions -- Keyboard scroll handler on the focusable table region. */
  return (
    <section
      className={cn('w-full min-w-0 text-(--abc-text-default-primary)', styles)}
      id={renderingId}
    >
      {(titleField || isEditing) && (
        <Text
          className="block w-full min-w-0 max-w-full break-words whitespace-pre-line pb-(--abc-spacing-inset-lg) text-(--abc-text-default-primary) font-sans font-bold text-[length:var(--abc-font-size-heading-sm)] leading-[var(--abc-font-line-height-heading-sm)]"
          field={titleField}
          id={titleId}
          tag="h3"
        />
      )}

      {(descriptionField || isEditing) && (
        <RichText
          className="mb-(--abc-spacing-gap-lg) text-body-md wrap-anywhere"
          field={descriptionField}
          id={descriptionId}
        />
      )}

      {totalColumns > 0 && (
        <div
          aria-label={titleText ? `Table: ${titleText}` : 'Data table'}
          aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
          className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain [scrollbar-color:var(--abc-border-default-secondary)_var(--abc-surface-default-secondary)] [scrollbar-width:thin] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-(--abc-surface-default-secondary) [&::-webkit-scrollbar-thumb]:rounded-(--abc-radius-pill) [&::-webkit-scrollbar-thumb]:bg-(--abc-border-default-secondary) rounded-(--abc-radius-md) border border-(--abc-border-default-primary) bg-(--abc-surface-default-secondary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--abc-border-focus)"
          role="region"
          // Allows keyboard users to focus and horizontally scroll the table region.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        >
          <ShadcnTable
            aria-describedby={descriptionField ? descriptionId : undefined}
            aria-label={titleText ? undefined : 'Data table'}
            aria-labelledby={titleText ? titleId : undefined}
            className="w-full min-w-full table-auto border-separate border-spacing-0 text-left text-body-md"
            style={{ minWidth: `${minTableWidth}px` }}
          >
            <colgroup>
              {columns.map((columnIndex) => (
                <col key={`column-${columnIndex}`} style={{ width: `${MIN_COLUMN_WIDTH}px` }} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow>
                {columns.map((columnIndex) => {
                  const cell = headerRow?.rowCells?.[columnIndex];
                  const headerId = `${tableId}-header-${columnIndex}`;
                  const headerContent = renderRowCell(cell);

                  return (
                    <TableHead
                      className="min-w-[160px] wrap-anywhere whitespace-normal border-b border-(--abc-border-default-secondary) bg-(--abc-surface-default-secondary) px-(--abc-spacing-inset-xl) py-(--abc-spacing-inset-md) text-left text-label-sm font-bold align-middle"
                      key={cell?.id ?? `header-${columnIndex}`}
                      id={headerId}
                      scope="col"
                    >
                      {columnIndex === 0 ? (
                        <div className="max-w-[150px] lg:max-w-none">{headerContent}</div>
                      ) : (
                        headerContent
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bodyRows.map((row, rowIndex) => (
                <TableRow key={row.id ?? `row-${rowIndex}`}>
                  {columns.map((columnIndex) => {
                    const cell = row.rowCells?.[columnIndex];
                    const headerId = `${tableId}-header-${columnIndex}`;

                    return (
                      <TableCell
                        className={cn(
                          'h-(--abc-components-table-cell-height) min-w-[160px] wrap-anywhere whitespace-normal border-b border-(--abc-border-default-secondary) bg-(--abc-surface-default-primary) px-(--abc-spacing-inset-xl) py-(--abc-spacing-inset-md) text-left align-middle',
                          rowIndex === bodyRows.length - 1 && 'border-b-0'
                        )}
                        headers={headerId}
                        key={cell?.id ?? `cell-${rowIndex}-${columnIndex}`}
                      >
                        {renderRowCell(cell)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </ShadcnTable>
        </div>
      )}
    </section>
  );
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
}
