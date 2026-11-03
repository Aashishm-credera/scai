import React, { JSX } from 'react';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import { ColumnNumber, ColumnSplitterProps } from './column-splitter.props';

export const Default = ({
  params,
  rendering,
  page,
  componentMap,
}: ColumnSplitterProps): JSX.Element => {
  const { EnabledPlaceholders, RenderingIdentifier: id, styles } = params;

  const enabledColumns = EnabledPlaceholders?.split(',') ?? [];

  return (
    <section className={`row component column-splitter flex flex-wrap  py-10  ${styles ?? ''}`} id={id}>
      {enabledColumns.map((columnNum, index) => {
        const num = Number(columnNum) as ColumnNumber;
        const columnWidth = params[`ColumnWidth${num}`] ?? '';
        const columnStyle = params[`Styles${num}`] ?? '';
        const columnClassNames = `${columnWidth} ${columnStyle} max-md:w-full max-md:max-w-full max-md:basis-full`.trim();

        return (
          <div key={index} className={columnClassNames}>
            <div className="row">
              <AppPlaceholder
                name={`column-${columnNum}-{*}`}
                rendering={rendering}
                page={page}
                componentMap={componentMap}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
};
