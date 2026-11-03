import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Separate build output for the local container (NEXTJS_DIST_DIR in docker-compose.override.yml)
  // so it does not collide with a host `npm run dev` sharing the same mounted folder.
  distDir: process.env.NEXTJS_DIST_DIR || '.next',

  // Enable Cache Components (`use cache`, `cacheTag`) in Next.js App Router.
  cacheComponents: true,

  
  experimental: {
    // The root layout lives under [site]/[locale] (for <html lang>), so unmatched URLs
    // are rendered by src/app/global-not-found.tsx.
    globalNotFound: true,
  },

  // HSTS: 2 years, include subdomains, preload omitted.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000;includeSubDomains',
          },
        ],
      },
    ];
  },

  // use this configuration to ensure that only images from the whitelisted domains
  // can be served from the Next.js Image Optimization API
  // see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    // Local containers serve media from the CM host (xmcloudcm.localhost), which the dev server
    // cannot fetch for optimization, so the browser loads the original image instead.
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edge*.**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'xmc-*.**',
        port: '',
      },
    ],
  },

  // use this configuration to serve the sitemap.xml, robots.txt and llms.txt files from the API route handlers
  rewrites: async () => {
    return [
      {
        source: '/sitemap:id([\\w-]{0,}).xml',
        destination: '/api/sitemap',
        locale: false,
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
        locale: false,
      },
      {
        source: '/llms.txt',
        destination: '/api/llms-txt',
        locale: false,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
