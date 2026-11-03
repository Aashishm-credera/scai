import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSitecoreErrorPage } from 'lib/cache/get-sitecore-error-page';
import scConfig from 'sitecore.config';
import { ErrorPage } from '@sitecore-content-sdk/nextjs';
import Layout from 'src/Layout';
import Providers from 'src/Providers';
import { lubDub } from '@/design-system/fonts/lub-dub';

// Rendered for URLs that match no route, outside the [site]/[locale] root layout,
// so it provides its own <html> and <body>. Next.js adds the noindex robots tag to not-found responses.
export const metadata: Metadata = {
  title: 'Page not found',
};

async function NotFoundContent() {
  if (scConfig.defaultSite) {
    const page = await getSitecoreErrorPage({
      site: scConfig.defaultSite,
      locale: scConfig.defaultLanguage,
      code: ErrorPage.NotFound,
    });

    if (page) {
      return (
        <Providers page={page}>
          <Layout page={page} />
        </Providers>
      );
    }
  }

  return (
    <div style={{ padding: 10 }}>
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link href="/">Go to the Home page</Link>
    </div>
  );
}

export default function GlobalNotFound() {
  return (
    <html lang={scConfig.defaultLanguage} className={lubDub.variable}>
      <body>
        <NotFoundContent />
      </body>
    </html>
  );
}
