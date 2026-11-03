import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Table } from '@/design-system/molecules/Table/Table';
import type { TableProps } from '@/design-system/molecules/Table/table.props';

const createProps = (overrides: Partial<TableProps> = {}): TableProps => ({
  titleField: { value: 'Table title' },
  descriptionField: { value: '<p>Table description</p>' },
  tableRows: [
    {
      id: 'header',
      rowCells: [
        { id: 'heading-feature', fieldType: 'TextField', field: { value: 'Feature' } },
        { id: 'heading-details', fieldType: 'TextField', field: { value: 'Details' } },
      ],
    },
    {
      id: 'row-1',
      rowCells: [
        {
          id: 'label',
          fieldType: 'LabelItemField',
          field: {
            text: 'Recommended',
            color: 'success',
            icon: 'interface/general/check',
          },
        },
        { id: 'description', fieldType: 'TextField', field: { value: 'First detail' } },
      ],
    },
  ],
  totalRows: 2,
  totalColumns: 2,
  isEditing: false,
  ...overrides,
});

const render = (props: TableProps = createProps()) => renderToStaticMarkup(<Table {...props} />);

describe('Table molecule', () => {
  it('renders the title, description, headers, body cells, and label fields', () => {
    const html = render();

    expect(html).toContain('<h3');
    expect(html).toContain('text-[length:var(--abc-font-size-heading-sm)]');
    expect(html).toContain('Table title');
    expect(html).toContain('Table description');
    expect(html).toContain('scope="col"');
    expect(html).toContain('Feature');
    expect(html).toContain('Details');
    expect(html).toContain('Recommended');
    expect(html).toContain('First detail');
    expect(html).toContain('text-(--abc-feedback-success-text-primary)');
    expect(html).toContain('max-w-none whitespace-nowrap text-center');
    expect(html).toContain('[&amp;&gt;span]:whitespace-nowrap');
    expect(html).toContain('[&amp;&gt;span]:font-(family-name:--abc-font-family-body)');
    expect(html).toContain('[&amp;&gt;span]:text-(length:--abc-font-size-text-sm)');
    expect(html).toContain('[&amp;&gt;span]:leading-(--abc-font-line-height-text-sm)');
    expect(html).toContain('[&amp;&gt;span]:font-medium');
    expect(html).toContain('data-abc-icon="interface/general/check"');
  });

  it('associates the table with its title and description and body cells with column headers', () => {
    const html = render();
    const titleId = html.match(/<h3[^>]*id="([^"]+)"/)?.[1];
    const descriptionId = html.match(/aria-describedby="([^"]+)"/)?.[1];
    const headerId = html.match(/<th[^>]*id="([^"]+-header-0)"/)?.[1];

    expect(titleId).toBeDefined();
    expect(descriptionId).toBeDefined();
    expect(headerId).toBeDefined();
    expect(html).toContain(`aria-labelledby="${titleId}"`);
    expect(html).toContain(`aria-describedby="${descriptionId}"`);
    expect(html).toContain(`id="${descriptionId}"`);
    expect(html).toContain(`headers="${headerId}"`);
    expect(html).toContain('role="region"');
    expect(html).toContain('tabindex="0"');
  });

  it('uses responsive table dimensions and allows header text to wrap', () => {
    const html = render(createProps({ totalColumns: 5 }));
    const table = html.match(/<table[^>]*>/)?.[0];
    const header = html.match(/<th(?=\s|>)[^>]*>/)?.[0];
    const cell = html.match(/<td(?=\s|>)[^>]*>/)?.[0];

    expect(table).toContain('w-full');
    expect(table).toContain('min-w-full');
    expect(table).toContain('table-auto');
    expect(table).toContain('min-width:800px');
    expect(header).toContain('whitespace-normal');
    expect(header).toContain('wrap-anywhere');
    expect(header).not.toContain('whitespace-nowrap');
    expect(header).toContain('border-(--abc-border-default-secondary)');
    expect(header).toContain('px-(--abc-spacing-inset-xl)');
    expect(header).toContain('py-(--abc-spacing-inset-md)');
    expect(header).toContain('text-label-sm');
    expect(header).toContain('font-bold');
    expect(header).toContain('align-middle');
    expect(header).toContain('min-w-[160px]');
    expect(cell).toContain('h-(--abc-components-table-cell-height)');
    expect(cell).toContain('min-w-[160px]');
    expect(cell).toContain('wrap-anywhere');
    expect(cell).toContain('whitespace-normal');
    expect(cell).toContain('px-(--abc-spacing-inset-xl)');
    expect(cell).toContain('py-(--abc-spacing-inset-md)');
    expect(cell).toContain('align-middle');
    expect(table).toContain('text-body-md');
    expect(table).not.toContain('text-body-xs');
    expect(table).not.toContain('md:text-body-sm');
    expect(header).not.toContain('font-semibold');
    expect(html).toContain('text-label-sm');
    expect(html).toContain('max-w-[150px] lg:max-w-none');
    expect([...html.matchAll(/<col style="width:160px"\/>/g)]).toHaveLength(5);
  });

  it('allows horizontal scrolling when a four-column table reaches minimum widths', () => {
    const html = render(createProps({ totalColumns: 4 }));
    const table = html.match(/<table[^>]*>/)?.[0];

    expect(table).toContain('min-width:640px');
  });

  it('preserves minimum column widths for tables with more than five columns', () => {
    const tableRows = [
      {
        id: 'header',
        rowCells: Array.from({ length: 6 }, (_, index) => ({
          id: `header-${index}`,
          fieldType: 'TextField' as const,
          field: { value: `Header ${index + 1}` },
        })),
      },
    ];
    const html = render(createProps({ tableRows, totalColumns: 6 }));
    const table = html.match(/<table[^>]*>/)?.[0];

    expect(table).toContain('min-width:960px');
  });

  it('applies the rounded border and clipping surface to the scroll container', () => {
    const html = render();
    const region = html.match(/<div[^>]*role="region"[^>]*>/)?.[0];
    const table = html.match(/<table[^>]*>/)?.[0];

    expect(region).toContain('rounded-(--abc-radius-md)');
    expect(region).toContain('border-(--abc-border-default-primary)');
    expect(region).toContain('bg-(--abc-surface-default-secondary)');
    expect(region).toContain('[scrollbar-width:thin]');
    expect(region).toContain('[&amp;::-webkit-scrollbar]:block');
    expect(region).toContain('[&amp;::-webkit-scrollbar]:h-2');
    expect(region).toContain('[&amp;::-webkit-scrollbar-thumb]:rounded-(--abc-radius-pill)');
    expect(table).not.toContain('rounded-(--abc-radius-md)');
    expect(table).not.toContain('border-(--abc-border-default-primary)');
  });

  it('keeps row dividers through the table and removes only the final row divider', () => {
    const html = render(
      createProps({
        tableRows: [
          {
            id: 'header',
            rowCells: [{ id: 'heading', fieldType: 'TextField', field: { value: 'Heading' } }],
          },
          {
            id: 'first-row',
            rowCells: [{ id: 'first-cell', fieldType: 'TextField', field: { value: 'First' } }],
          },
          {
            id: 'last-row',
            rowCells: [{ id: 'last-cell', fieldType: 'TextField', field: { value: 'Last' } }],
          },
        ],
        totalColumns: 1,
      })
    );
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
    const bodyRows = rows.slice(1);

    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]).toContain('border-(--abc-border-default-secondary)');
    expect(bodyRows[0]).not.toContain('border-b-0');
    expect(bodyRows[1]).toContain('border-b-0');
  });

  it('renders the supplied column count, including empty cells in shorter rows', () => {
    const html = render(
      createProps({
        tableRows: [
          {
            id: 'header',
            rowCells: [{ id: 'heading', fieldType: 'TextField', field: { value: 'Heading' } }],
          },
          {
            id: 'short-row',
            rowCells: [{ id: 'cell', fieldType: 'TextField', field: { value: 'Value' } }],
          },
        ],
        totalColumns: 3,
      })
    );

    expect(html.match(/scope="col"/g)).toHaveLength(3);
    expect(html.match(/<td/g)).toHaveLength(3);
  });

  it('does not render a table when no columns are supplied', () => {
    const html = render(
      createProps({
        titleField: undefined,
        descriptionField: undefined,
        isEditing: true,
        tableRows: undefined,
        totalColumns: 0,
      })
    );

    expect(html).toContain('<section');
    expect(html).not.toContain('<table');
  });

  it('applies the caller styles and rendering id to the section', () => {
    const html = render(createProps({ styles: 'custom-table', renderingId: 'table-id' }));

    expect(html).toContain('class="w-full min-w-0 text-(--abc-text-default-primary) custom-table"');
    expect(html).toContain('id="table-id"');
  });
});
