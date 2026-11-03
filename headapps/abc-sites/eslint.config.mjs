import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import storybook from 'eslint-plugin-storybook';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const noStoriesImport = {
  group: ['**/stories/*', '**/stories/**'],
  message: 'Storybook-only modules must not be imported by production code.',
};

const restrict = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      '.next-container/**',
      '.sitecore/**',
      'build/**',
      'coverage/**',
      'design-tokens/generated/**',
      'node_modules/**',
      'out/**',
      'storybook-static/**',
      '**/*.generated.ts',
      'next-env.d.ts',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  ...nextVitals,
  ...nextTs,
  ...storybook.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'jsx-a11y/alt-text': [
        'error',
        { elements: ['img', 'object', 'area', 'input[type="image"]'] },
      ],
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { allowExpressionValues: true, roles: ['tabpanel'], tags: ['pre'] },
      ],
    },
  },
  {
    files: ['src/design-system/**/*.{ts,tsx}'],
    ignores: ['src/**/stories/**', 'src/**/tests/**'],
    rules: restrict([
      {
        group: ['@/components', '@/components/**'],
        message: 'The reusable design system must not depend on Sitecore rendering adapters.',
      },
      noStoriesImport,
    ]),
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/**', 'src/design-system/**', 'src/**/stories/**', 'src/**/tests/**'],
    rules: restrict([noStoriesImport]),
  },
  {
    files: ['design-tokens/**/*.mjs', 'scripts/**/*.mjs', '*.config.{mjs,ts}'],
    rules: { 'no-console': 'off' },
  },
  prettier,
];

export default eslintConfig;
