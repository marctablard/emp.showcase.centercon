import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

let nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.storyblok.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },

  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    // Exclude test files from being compiled by Next.js
    config.module.rules.push({
      test: /\.test\.(js|jsx|ts|tsx)$/,
      use: 'ignore-loader',
    });

    return config;
  },

  headers: async () => {
    const headers: any[] = [];
    /*
    if (process.env.NEXT_PUBLIC_ROBOTS_NOINDEX === 'true') {
      headers.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
        source: '/:path*',
      });
    }
  */
    return headers;
  },
};

// add i18n Logic to Next-Configuration
const withNextIntl = createNextIntlPlugin();

// Apply plugins in sequence
nextConfig = withNextIntl(nextConfig);

export default nextConfig;
