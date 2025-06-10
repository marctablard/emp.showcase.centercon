import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://emporix-showcase.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account/*',
        '/api/*',
        '/admin/*',
        '/_next/',
        '/cart/*',
        '/checkout/*', // Don't index order confirmation pages
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
