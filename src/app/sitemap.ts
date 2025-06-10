import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://emporix-showcase.com';

  // Define static pages
  const staticPages = ['', '/about', '/login', '/register', '/account', '/cart', '/contact'];

  // DUMMY Inplementation for now
  // Create entries for static pages in both locales
  const locales = ['en', 'de']; // Add more locales as needed
  const staticRoutes = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    })),
  );

  // In a real implementation, you would fetch dynamic routes like products
  // from your API or database and add them to the sitemap
  // Example:
  // const products = await fetchAllProducts();
  // const productRoutes = products.flatMap(product =>
  //   locales.map(locale => ({
  //     url: `${baseUrl}/${locale}/product/${product.id}`,
  //     lastModified: new Date(product.updatedAt),
  //     changeFrequency: 'daily' as const,
  //     priority: 0.9,
  //   }))
  // );

  return [
    ...staticRoutes,
    // ...productRoutes, // Uncomment when you implement dynamic routes
  ];
}
