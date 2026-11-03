import fs from 'fs';
import path from 'path';
import type { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';

// The nextjs package does not re-export the SDK's ScaffoldTemplate type.
type ScaffoldTemplate = ReturnType<typeof defineCliConfig>['scaffold']['templates'][number];

const FILE_EXTENSION = 'tsx';
const COMPONENTS_ROOT = 'src/components';
const APP_ROOT = process.cwd();

/**
 * The CLI only defaults to `src/components` when the name has no folder; a name such as
 * `features/PageContent/HeadingText/HeadingText` is otherwise written relative to the app root.
 * The CLI builds a relative output path, calls generateTemplate, then writes the file, so moving
 * the working directory here makes that relative path resolve under `src/components`.
 */
const moveToComponentsRoot = (componentName: string): void => {
  const nameArg = process.argv.find((arg) => arg.endsWith(`/${componentName}`));

  if (nameArg && !nameArg.startsWith('src/')) {
    process.chdir(path.join(APP_ROOT, COMPONENTS_ROOT));
  }
};

const toAppRelativePath = (filePath: string): string =>
  path.relative(APP_ROOT, path.resolve(filePath));

/** `HeadingText` -> `heading-text` */
const toKebabCase = (componentName: string): string =>
  componentName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** `HeadingText` -> `Heading Text` */
const toDisplayName = (componentName: string): string =>
  componentName.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

const generateTemplate = (componentName: string): string => {
  moveToComponentsRoot(componentName);

  const displayName = toDisplayName(componentName);

  return `import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { getDatasource, getFieldValue } from '@/lib/component-props';
import type { ${componentName}Props } from './${toKebabCase(componentName)}.props';

export const Default = ({ fields, params, page }: ${componentName}Props): JSX.Element | null => {
  const isEditing = page.mode.isEditing;
  const datasource = getDatasource(fields);

  // No datasource: nothing on the published page, a hint in Page Builder.
  if (!datasource || Object.keys(datasource).length === 0) {
    return isEditing ? (
      <span className="is-empty-hint">Missing ${displayName} Datasource</span>
    ) : null;
  }

  const title = getFieldValue(datasource.Title);

  // Empty fields still render in Page Builder so authors can fill them in.
  if (!title?.value && !isEditing) {
    return null;
  }

  return (
    <div
      id={params.RenderingIdentifier || undefined}
      className={params.styles?.trim() || undefined}
    >
      <Text field={title} />
    </div>
  );
};
`;
};

const generatePropsTemplate = (componentName: string): string =>
  `import type { Field } from '@sitecore-content-sdk/nextjs';
import type { CompatibleDatasource, CompatibleField, ComponentProps } from '@/lib/component-props';

export interface ${componentName}Fields {
  /** Placeholder: replace with the datasource template fields. Names are case-sensitive JSON keys. */
  Title?: CompatibleField<Field<string>>;
}

export interface ${componentName}Props extends ComponentProps {
  fields?: CompatibleDatasource<${componentName}Fields>;
}
`;

/**
 * A scaffold template can only return one file, so the props sidecar is written here: the CLI
 * calls this once, with the component path, and only when the component file was created.
 */
const getNextSteps = (componentOutputPath: string): string[] => {
  const componentName = path.basename(componentOutputPath, `.${FILE_EXTENSION}`);
  const propsOutputPath = path.join(
    path.dirname(componentOutputPath),
    `${toKebabCase(componentName)}.props.ts`
  );

  if (!fs.existsSync(propsOutputPath)) {
    fs.writeFileSync(propsOutputPath, generatePropsTemplate(componentName), 'utf8');
  }

  return [
    `* Replace the placeholder Title field in ${toAppRelativePath(propsOutputPath)}`,
    `* Implement the component in ${toAppRelativePath(componentOutputPath)}`,
    '* Run npm run sitecore-tools:generate-map',
  ];
};

/** Replaces the SDK `default` template with the component + props sidecar structure used here. */
export const componentTemplate: ScaffoldTemplate = {
  name: 'default',
  fileExtension: FILE_EXTENSION,
  generateTemplate,
  getNextSteps,
};
