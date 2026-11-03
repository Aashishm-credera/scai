import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      // These components only compose Storybook documentation and controls.
      // Coverage belongs to the exported icon/logo runtime components instead, and to
      // design-tokens/token-tree.ts — the only design-tokens file with logic worth testing.
      exclude: [
        'src/design-system/design/*/stories/**',
        'src/design-system/design/design-tokens/*Tokens.tsx',
        'src/design-system/design/design-tokens/TokenLayout.tsx',
        'src/design-system/design/design-tokens/TypographyPlayground.tsx',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        statements: 95,
        branches: 90,
      },
    },
    projects: [
      {
        resolve: {
          alias: {
            '@': path.resolve(dirname, 'src'),
            // tsconfig `paths` are invisible to Vite, so this has to be restated here the
            // same way .storybook/main.ts restates it.
            '@design-tokens': path.resolve(dirname, 'design-tokens'),
          },
        },
        oxc: {
          jsx: {
            runtime: 'automatic',
            importSource: 'react',
          },
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          api: {
            host: '127.0.0.1',
          },
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
