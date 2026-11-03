import type { Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

// Pulls in Tailwind and the generated Figma tokens for the isolated Storybook catalog.
import './storybook.css';
import { lubDub } from '@/design-system/fonts/lub-dub';
import { abcTheme } from './theme';

// Mirrors <html className={lubDub.variable}> in the root layout, so stories get the same next/font
// Lub Dub (and its fallback) as the site.
document.documentElement.classList.add(lubDub.variable);

/**
 * The app wraps pages in NextIntlClientProvider (see the [site]/[locale] route), and any
 * component calling useTranslations() throws without it. Messages are intentionally empty:
 * Phase 5 has not landed yet, so there is no src/messages/en.json to load. Once it exists,
 * import it and pass it here, nothing else about this decorator changes.
 */
const preview: Preview = {
  // On globally, so a new component gets a documented props table without anyone remembering to
  // opt in. It also gives the multi-story Design pages, Colors and Typography, a combined
  // view for free, since the generated Docs entry stacks every story in one scroll.
  //
  // The single-story pages and the icon/logo galleries opt back out with `tags: ['!autodocs']`:
  // a Docs entry that restates one story, plus an empty controls table, is only noise.
  tags: ['autodocs'],

  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={{}}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
  parameters: {
    docs: {
      // Storybook Docs otherwise injects its default Nunito Sans theme over the preview CSS.
      theme: abcTheme,
    },
    backgrounds: {
      default: 'light',
      options: {
        light: { name: 'Light', value: '#ffffff' },
        dark: { name: 'Dark', value: '#1d1b16' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // One tree in the approved Design-then-Atoms order.
    //
    // A function rather than an `order` list, because Storybook otherwise lists unlisted entries
    // in file discovery order. Components sort alphabetically within their level; stories
    // within a component keep the order their file declares them in.
    options: {
      storySort: (a, b) => {
        // Storybook evaluates this function's source text as plain JavaScript. So everything it
        // uses is declared inside it, and it has no TypeScript annotations: the default values
        // below are what give `rank` its types.
        const levels = ['Welcome', 'Design', 'Atoms'];
        // Design pages read the way a design system is read: what a color is, then how type
        // sits on it, then the spatial scales.
        const designPages = [
          'Design Tokens',
          'Colors',
          'Typography',
          'Spacing',
          'Radius',
          'Elevation',
          'Breakpoints',
          'Icons',
          'Logos',
        ];
        const rank = (list = [''], name = '') =>
          list.includes(name) ? list.indexOf(name) : list.length;
        const [aLevel, aName = ''] = a.title.split('/');
        const [bLevel, bName = ''] = b.title.split('/');
        const byDesignOrder =
          aLevel === 'Design' ? rank(designPages, aName) - rank(designPages, bName) : 0;

        return (
          rank(levels, aLevel) - rank(levels, bLevel) || byDesignOrder || aName.localeCompare(bName)
        );
      },
    },

    // Figma FRAME widths (390 / 768 / 1280 / 1600), not the CSS breakpoints (480 / 1024 / 1600
    // in theme.css). Each frame is at or above its breakpoint, so the matching md:/lg:/xl:
    // fires at that preset. The grid stories are only meaningful if you can switch between these.
    viewport: {
      options: {
        mobile: { name: 'Mobile, 390px (S, < 480)', styles: { width: '390px', height: '844px' } },
        md: { name: 'Tablet, 768px (M, >= 480)', styles: { width: '768px', height: '1024px' } },
        lg: { name: 'Desktop, 1280px (L, >= 1024)', styles: { width: '1280px', height: '900px' } },
        xl: { name: 'Large, 1600px (XL, >= 1600)', styles: { width: '1600px', height: '1000px' } },
      },
    },

    a11y: {
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
};

export default preview;
