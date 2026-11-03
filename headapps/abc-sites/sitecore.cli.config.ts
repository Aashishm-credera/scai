import { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';
import {
  generateSites,
  generateMetadata,
  extractFiles,
  writeImportMap,
} from '@sitecore-content-sdk/nextjs/tools';
import scConfig from './sitecore.config';
import { componentTemplate } from './scripts/scaffold-component-template';

/** The one build command that calls Sitecore Edge. sitecore.cli.offline.config.ts swaps it out. */
export const generateSitesFromEdge = generateSites();

const cliConfig = defineCliConfig({
  config: scConfig,
  build: {
    commands: [
      generateMetadata(),
      generateSitesFromEdge,
      extractFiles(),
      writeImportMap({
        paths: ['src/components'],
      }),
    ],
  },
  componentMap: {
    paths: ['src/components'],
    exclude: [
      'src/components/content-sdk/*',
      'src/components/**/*.props.ts',
      'src/components/**/*.props.tsx',
      // Foundation .ts modules are shared helpers, not renderings.
      'src/components/foundation/**/*.ts',
    ],
  },
});

// defineCliConfig puts the SDK templates first and the CLI uses the first match by name, so ours
// has to go in front afterwards to replace the stock `default` template.
cliConfig.scaffold.templates.unshift(componentTemplate);

export default cliConfig;
