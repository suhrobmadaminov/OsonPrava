import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.osonprava.uz' },
    ],
  },
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap' },
    ];
  },
};

export default withNextIntl(config);
