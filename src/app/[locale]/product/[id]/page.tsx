import { cache } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/product-detail';
import { JsonLd } from '@/components/seo/json-ld';
import { UiBreadcrumb } from '@/components/ui/molecules/ui-breadcrumb';
import { generateBreadcrumbForProduct } from '@/lib/breadcrumb';
import { getProductPrice } from '@/lib/ssr/price';
import { getProductById } from '@/lib/ssr/products';
import { generateProductJsonLd, generateProductMetadata } from '@/lib/ssr/seo';

interface ProductPageProps {
  id: string;
  locale: string;
}

// Generate metadata for the product page
export async function generateMetadata(
  { params }: { params: Promise<ProductPageProps> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  // Get the product ID and locale from params
  const { id, locale } = await params;

  // Fetch product data
  const [product, price] = await Promise.all([getProductById(id), getProductPrice(id)]);

  // If product not found, return basic metadata
  if (!product) {
    return {};
  }
  // Use the extracted SEO utility function to generate metadata
  return generateProductMetadata(product, price, locale);
}

export default async function ProductPage({ params }: { params: Promise<ProductPageProps> }) {
  const { id, locale } = await params;

  // Fetch translations, product data and price in parallel
  const [product, price] = await Promise.all([getProductById(id), getProductPrice(id)]);

  // If product not found, show 404 page
  if (!product) {
    notFound();
  }
  const jsonLd = await generateProductJsonLd(product, locale);
  const breadcrumbs = generateBreadcrumbForProduct(product, locale);
  return (
    <div className="container mx-auto">
      <UiBreadcrumb items={breadcrumbs} />
      <JsonLd jsonLd={jsonLd} />
      <ProductDetail product={product} price={price} />
    </div>
  );
}
