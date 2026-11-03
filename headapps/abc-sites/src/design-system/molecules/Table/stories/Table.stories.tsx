import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BaseContainer } from '@/design-system/atoms/BaseContainer/BaseContainer';
import { Table } from '@/design-system/molecules/Table/Table';
import type {
  LabelItemField,
  Row,
  RowCell,
  TableProps,
} from '@/design-system/molecules/Table/table.props';

const textCell = (id: string, value: string): RowCell => ({
  id,
  fieldType: 'TextField',
  field: { value },
});

const labelCell = (id: string, field: LabelItemField): RowCell => ({
  id,
  fieldType: 'LabelItemField',
  field,
});

const createRows = (headers: string[], rows: Row[] = []): Row[] => [
  {
    id: 'header',
    rowCells: headers.map((header, index) => textCell(`header-${index}`, header)),
  },
  ...rows,
];

const createProps = (title: string, headers: string[], rows: Row[]): TableProps => ({
  titleField: { value: title },
  descriptionField: {
    value: '<p>Compare the available options and review the details in each column.</p>',
  },
  tableRows: createRows(headers, rows),
  totalRows: rows.length + 1,
  totalColumns: headers.length,
  isEditing: false,
});

const defaultArgs = createProps(
  'Blood Pressure Categories',
  ['Category', 'Care guidance'],
  [
    {
      id: 'normal',
      rowCells: [
        labelCell('normal-label', {
          text: 'Normal',
          color: 'success',
          icon: 'interface/general/check',
        }),
        textCell('normal-guidance', 'Continue heart-healthy habits.'),
      ],
    },
    {
      id: 'stage-1',
      rowCells: [
        labelCell('stage-1-label', { text: 'Stage 1', color: 'warning' }),
        textCell(
          'stage-1-guidance',
          'Your healthcare professional may recommend lifestyle changes or medication.'
        ),
      ],
    },
    {
      id: 'stage-2',
      rowCells: [
        labelCell('stage-2-label', { text: 'Stage 2', color: 'error' }),
        textCell(
          'stage-2-guidance',
          'Your healthcare professional may recommend medication and lifestyle changes.'
        ),
      ],
    },
  ]
);

const meta = {
  title: 'Molecules/Table',
  component: Table,
  tags: [],
  args: defaultArgs,
  argTypes: {
    titleField: {
      control: 'object',
      description: 'Optional Sitecore title field rendered above the table.',
    },
    descriptionField: {
      control: 'object',
      description: 'Optional sanitized Sitecore rich-text description.',
    },
    tableRows: {
      control: 'object',
      description: 'Mapped rows. The first row supplies the table column headers.',
    },
    totalRows: { control: false, table: { disable: true } },
    totalColumns: { control: false, table: { disable: true } },
    isEditing: { control: 'boolean' },
    styles: { control: 'text' },
    renderingId: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A presentation-only table molecule. Pass Sitecore fields and mapped row/cell data through the UI props; the PageContent Table rendering handles datasource mapping. Each column has a 160px minimum width, matching the Figma table-cell default, with responsive padding tokens. The first header wraps into two lines below the lg breakpoint; all headers use the responsive Label/sm typography token. The table scrolls horizontally on narrow viewports when needed. Cell heights, spacing, and typography use responsive design tokens. Body cells reference their column headers for assistive-technology context.',
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BackendRendering: Story = {
  render: () => (
    <article className="grid max-w-4xl gap-(--abc-spacing-gap-2xl) text-body-md text-(--abc-text-default-primary)">
      <header className="grid gap-(--abc-spacing-gap-sm)">
        <h2 className="text-heading-md font-bold">Sitecore rendering handoff</h2>
        <p>
          The PageContent Table rendering resolves the datasource, maps its rows and cells into the
          UI component props, and passes the editing state and rendering identifier through.
          Datasource lookup and field mapping stay outside this presentation component.
        </p>
      </header>
      <pre className="overflow-x-auto rounded-(--abc-radius-md) bg-(--abc-surface-default-secondary) p-(--abc-spacing-inset-lg)">
        <code>{`const datasource = getDatasource(fields);
const tableProps = mapTableDataToUIComponentProps(
  datasource,
  params.styles,
  page.mode.isEditing
);

return (
  <Table
    {...tableProps}
    renderingId={params.RenderingIdentifier || undefined}
  />
);`}</code>
      </pre>
    </article>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Shows how the PageContent rendering hands mapped Sitecore data to the UI table.',
      },
    },
  },
};

export const Gallery: Story = {
  render: () => {
    const examples: { title: string; props: TableProps }[] = [
      {
        title: 'Two-column table with labels',
        props: defaultArgs,
      },
      {
        title: 'Three-column comparison',
        props: createProps(
          'Care Options',
          ['Feature', 'Standard', 'Advanced'],
          [
            {
              id: 'access',
              rowCells: [
                textCell('access-feature', 'Care team access'),
                labelCell('access-standard', { text: 'Standard', color: 'blue' }),
                labelCell('access-advanced', { text: 'Enhanced', color: 'pink' }),
              ],
            },
          ]
        ),
      },
      {
        title: 'Long content and an empty cell',
        props: createProps(
          'Program Details',
          ['Program', 'Description'],
          [
            {
              id: 'program',
              rowCells: [
                textCell('program-name', 'Heart health assessment'),
                textCell(
                  'program-description',
                  'A detailed assessment with information that wraps naturally within the available column width.'
                ),
              ],
            },
            {
              id: 'follow-up',
              rowCells: [textCell('follow-up-name', 'Follow-up'), textCell('follow-up-detail', '')],
            },
          ]
        ),
      },
    ];

    return (
      <BaseContainer>
        <div className="grid gap-(--abc-spacing-gap-5xl)">
          {examples.map((example) => (
            <section className="w-full min-w-0" key={example.title}>
              <h2 className="mb-(--abc-spacing-gap-md) text-heading-md">{example.title}</h2>
              <Table {...example.props} />
            </section>
          ))}
        </div>
      </BaseContainer>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Compares column counts, label styles, and content lengths in representative tables.',
      },
    },
  },
};

export const Playground: Story = {
  args: defaultArgs,
  parameters: {
    docs: {
      description: {
        story:
          'Experiment with the props accepted by the Table component. `tableRows` contains mapped rows, with the first row providing the headers.',
      },
    },
  },
};
