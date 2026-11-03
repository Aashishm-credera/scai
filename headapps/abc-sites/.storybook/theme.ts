import { create } from 'storybook/theming/create';

/**
 * Shared branding for Storybook's manager UI and rendered Docs pages.
 *
 * Colors are copied from the generated primitives because the manager renders in a separate
 * frame where the application design-token variables are unavailable. The manager loads Lub Dub
 * through manager-head.html (a staticDirs mapping of src/design-system/fonts/lub-dub); preview
 * content gets it from next/font, as the site does (see preview.tsx).
 */
export const abcTheme = create({
  base: 'light',

  brandTitle: 'American Heart Association, Design System',
  brandUrl: '/',
  brandImage: '/logos/abc/wordmark/lg.svg',
  brandTarget: '_self',

  colorPrimary: '#cf222b',
  colorSecondary: '#cf222b',

  appBg: '#fdfdfc',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appHoverBg: '#ffe6e6',
  appBorderColor: '#dddcda',
  appBorderRadius: 8,

  textColor: '#1d1b16',
  textInverseColor: '#ffffff',
  textMutedColor: '#5b5a57',

  barTextColor: '#5b5a57',
  barSelectedColor: '#cf222b',
  barHoverColor: '#a0121d',
  barBg: '#ffffff',

  inputBg: '#ffffff',
  inputBorder: '#dddcda',
  inputTextColor: '#1d1b16',
  inputBorderRadius: 6,

  // Docs pages render in the preview, where next/font defines --font-lub-dub under a generated
  // family name. The manager has no such variable and falls back to manager-head.html's "Lub Dub".
  fontBase: 'var(--font-lub-dub, "Lub Dub"), Arial, Helvetica, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
});
