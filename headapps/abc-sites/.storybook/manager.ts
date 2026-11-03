import { addons } from 'storybook/manager-api';
import { abcTheme } from './theme';

addons.setConfig({
  theme: abcTheme,
  sidebar: {
    showRoots: true,
  },
});
