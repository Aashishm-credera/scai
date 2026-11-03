import localFont from 'next/font/local';

/**
 * Lub Dub through next/font: the files get hashed URLs cached for a year, they are preloaded, and
 * a size-adjusted Arial fallback keeps text from shifting when the font swaps in.
 *
 * All eight Lub Dub faces are registered, the same set the @font-face stylesheet declared. Next.js
 * preloads every file listed here on every page, so Light and Heavy Italic, which no token uses
 * today, cost about 60 KB per first visit.
 *
 * Apply `lubDub.variable` to <html>. globals.css points --abc-font-family-lub-dub at the
 * --font-lub-dub variable it defines, and every typography token follows from there.
 */
export const lubDub = localFont({
  src: [
    { path: './lub-dub/LubDubLight.woff2', weight: '300', style: 'normal' },
    { path: './lub-dub/LubDubLight-Italic.woff2', weight: '300', style: 'italic' },
    { path: './lub-dub/LubDubMedium.woff2', weight: '500', style: 'normal' },
    { path: './lub-dub/LubDubMedium-Italic.woff2', weight: '500', style: 'italic' },
    { path: './lub-dub/LubDubBold.woff2', weight: '700', style: 'normal' },
    { path: './lub-dub/LubDubBold-Italic.woff2', weight: '700', style: 'italic' },
    { path: './lub-dub/LubDubHeavy.woff2', weight: '900', style: 'normal' },
    { path: './lub-dub/LubDubHeavy-Italic.woff2', weight: '900', style: 'italic' },
  ],
  variable: '--font-lub-dub',
  display: 'swap',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
  adjustFontFallback: 'Arial',
});
