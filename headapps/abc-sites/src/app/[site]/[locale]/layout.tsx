import '../../globals.css';
import type { Metadata, Viewport } from 'next';
import { draftMode } from 'next/headers';
import { Suspense } from 'react';
import Bootstrap from 'src/Bootstrap';
import { lubDub } from '@/design-system/fonts/lub-dub';

// Favicons are hardcoded so they stay consistent across all sites. favicon.ico stays at the root of /public
// for older browsers and clients that request /favicon.ico directly; other icons are served from /public/favicons.
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicons/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

// Next.js always renders <meta charset="utf-8">; the viewport is declared explicitly.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

/**
 * Root layout. Lives under [site]/[locale] so <html lang> reflects the current Sitecore page language.
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string; locale: string }>;
}) {
  const { site, locale } = await params;

  return (
    <html lang={locale} className={lubDub.variable}>
      <body>
        <Suspense fallback={null}>
          <Bootstrap siteName={site} isPreviewMode={(await draftMode()).isEnabled} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
