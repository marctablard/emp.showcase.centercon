import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
let nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
};
 
// add i18n Logic to Next-Configuration
const withNextIntl = createNextIntlPlugin();

// Apply plugins in sequence
nextConfig = withNextIntl(nextConfig);

export default nextConfig;
