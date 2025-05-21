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
  }
};
 
// add i18n Logic to Next-Configuration
const withNextIntl = createNextIntlPlugin();

// Apply plugins in sequence
nextConfig = withNextIntl(nextConfig);

export default nextConfig;
