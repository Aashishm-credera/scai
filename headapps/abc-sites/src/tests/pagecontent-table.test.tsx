import { renderToStaticMarkup } from 'react-dom/server';
import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { describe, expect, it } from 'vitest';
import { Default as TableRendering } from '@/components/features/PageContent/Table/Table';
import type { TableProps } from '@/components/features/PageContent/Table/table.props';

const createRenderingProps = (fields: TableProps['fields'], isEditing = false): TableProps =>
  ({
    fields,
    rendering: {},
    params: { RenderingIdentifier: 'sitecore-table', styles: 'custom-table' },
    page: {
      layout: {},
      locale: 'en',
      mode: {
        name: isEditing ? LayoutServicePageState.Edit : LayoutServicePageState.Normal,
        designLibrary: { isVariantGeneration: false },
        isNormal: !isEditing,
        isPreview: false,
        isEditing,
        isDesignLibrary: false,
      },
    },
  }) as TableProps;

describe('PageContent Table adapter', () => {
  it('maps Sitecore rows, text fields, and label references into the table molecule', () => {
    const props = createRenderingProps({
      data: {
        datasource: {
          Title: { jsonValue: { value: 'Care options' } },
          Description: { jsonValue: { value: '<p>Compare options.</p>' } },
          TableRows: {
            results: [
              {
                id: 'header',
                RowCells: {
                  results: [
                    { id: 'header-category', Text: { jsonValue: { value: 'Category' } } },
                    { id: 'header-detail', Text: { value: 'Details' } },
                  ],
                },
              },
              {
                id: 'body',
                RowCells: {
                  results: [
                    {
                      id: 'body-label',
                      Label: {
                        targetItem: {
                          Text: { value: 'Recommended' },
                          Color: { value: 'foreground-success' },
                          Icon: {
                            name: 'check',
                            url: '/icons/Interface/General/check.svg',
                            fields: {},
                          },
                        },
                      },
                    },
                    { id: 'body-text', Text: { value: 'Available' } },
                  ],
                },
              },
            ],
          },
        },
      },
    });

    const html = renderToStaticMarkup(<TableRendering {...props} />);

    expect(html).toContain('Care options');
    expect(html).toContain('Compare options.');
    expect(html).toContain('Category');
    expect(html).toContain('Details');
    expect(html).toContain('Recommended');
    expect(html).toContain('Available');
    expect(html).toContain('bg-(--abc-feedback-success-bg-primary)');
    expect(html).toContain('text-(--badge-foreground-success)');
    expect(html).not.toContain('bg-(--abc-accent-surface-neutral)');
    expect(html).toContain('data-abc-icon="interface/general/check"');
    expect(html).toContain('id="sitecore-table"');
    expect(html).toContain('custom-table');
  });

  it('uses the direct Sitecore datasource shape as well as a wrapped datasource', () => {
    const props = createRenderingProps({
      Title: { value: 'Direct datasource title' },
      TableRows: {
        results: [
          {
            id: 'header',
            RowCells: { results: [{ id: 'heading', Text: { value: 'Heading' } }] },
          },
        ],
      },
    });

    expect(renderToStaticMarkup(<TableRendering {...props} />)).toContain(
      'Direct datasource title'
    );
  });

  it('shows a missing-datasource hint only in editing mode', () => {
    const publishedHtml = renderToStaticMarkup(
      <TableRendering {...createRenderingProps(undefined)} />
    );
    const editingHtml = renderToStaticMarkup(
      <TableRendering {...createRenderingProps(undefined, true)} />
    );

    expect(publishedHtml).toBe('');
    expect(editingHtml).toContain('Missing Table Datasource');
  });

  it('keeps empty text fields available in Page Builder', () => {
    const props = createRenderingProps(
      {
        TableRows: {
          results: [
            {
              id: 'header',
              RowCells: { results: [{ id: 'heading', Text: { value: 'Heading' } }] },
            },
            {
              id: 'body',
              RowCells: { results: [{ id: 'empty-cell', Text: { value: '' } }] },
            },
          ],
        },
      },
      true
    );

    const html = renderToStaticMarkup(<TableRendering {...props} />);

    expect(html).toContain('<table');
    expect(html).toContain('<td');
  });
});
