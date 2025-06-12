import { cache } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/product-detail';
import { JsonLd } from '@/components/seo/json-ld';
import { getProductById } from '@/lib/ssr/products';
import { generateProductJsonLd, generateProductMetadata } from '@/lib/ssr/seo';

interface ProductPageProps {
  id: string;
  locale: string;
}

const getProductWithPrices = cache(async (id: string) => {
  const product = await getProductById(id);
  if (product) {
    product.price = {
      amount: 110.45,
      currency: 'EUR',
      tiers: [
        { quantity: 1, amount: 110.45 },
        { quantity: 5, amount: 95.45 },
        { quantity: 10, amount: 85.45 },
        { quantity: 20, amount: 82.45 },
        { quantity: 50, amount: 79.45 },
      ],
    };
  }
  return product;
});

// Generate metadata for the product page
export async function generateMetadata(
  { params }: { params: Promise<ProductPageProps> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  // Get the product ID and locale from params
  const productId = (await params).id;
  const locale = (await params).locale;

  // Fetch product data
  const product = await getProductWithPrices(productId);

  // Use the extracted SEO utility function to generate metadata
  return generateProductMetadata(product, locale);
}

export default async function ProductPage({ params }: { params: Promise<ProductPageProps> }) {
  const { id, locale } = await params;

  // Fetch product data server-side using our shared API layer
  const product = await getProductWithPrices(id);

  // If product not found, show 404 page
  if (!product) {
    notFound();
  }
  const jsonLd = await generateProductJsonLd(product, locale);

  return (
    <>
      <JsonLd jsonLd={jsonLd} />
      <ProductDetail product={product} />
    </>
  );
}
