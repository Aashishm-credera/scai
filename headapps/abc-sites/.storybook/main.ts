import type { StorybookConfig } from '@storybook/nextjs-vite';
import { fileURLToPath } from 'node:url';
import remarkGfm from 'remark-gfm';

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const config: StorybookConfig = {
  stories: [
    // Welcome.mdx lives here rather than under src/ because it documents the workspace, not a
    // component. Listed first so the landing page is what opens by default.
    './*.mdx',
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  // Sample images for stories live beside the Storybook config, not in public/, so they never
  // ship with the site.
  staticDirs: [
    '../public',
    { from: './static', to: '/story-assets' },
    // The manager UI runs outside Next.js, so manager-head.html loads Lub Dub with plain @font-face.
    { from: '../src/design-system/fonts/lub-dub', to: '/fonts/lub-dub' },
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    {
      // Storybook's MDX pipeline is CommonMark only, so GitHub-flavoured syntax. Tables above
      // all. Renders as literal text with the pipes showing. Every table in our .mdx docs
      // needs this plugin to become an actual <table>.
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      // tsconfig `paths` are invisible to Vite, so these have to be restated.
      '@': resolve('../src'),
      // Lets stories import test doubles as '#mocks/DemoBlock' instead of counting ../ levels
      // back out of src. Those relative paths break every time a component moves folder.
      '#mocks': resolve('./mocks'),
      // Shared runtime tokens; this resolves to the same generated module used by Next.js.
      '@design-tokens': resolve('../design-tokens'),
    };
    return viteConfig;
  },
};

export default config;
