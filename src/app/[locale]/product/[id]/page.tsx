import { cache } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ProductActions from '@/components/product/product-actions';
import { ProductCarousel } from '@/components/product/product-carousel';
import { ProductPriceComponent } from '@/components/product/product-price';
import { ProductTabsComponent } from '@/components/product/product-tabs';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useL10n } from '@/hooks/useL10n';
import { getProductPrice } from '@/lib/ssr/price';
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
  const productId = (await params).id;
  const locale = (await params).locale;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { l10n } = useL10n(locale);

  // Fetch translations, product data and price in parallel
  const [t, product, price] = await Promise.all([
    getTranslations({ locale, namespace: 'product' }),
    getProductById(productId),
    getProductPrice(productId),
  ]);

  // If product not found, show 404 page
  if (!product) {
    notFound();
  }
  const jsonLd = await generateProductJsonLd(product, locale);

  return (
    <>
      <JsonLd jsonLd={jsonLd} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden border-0 shadow-none mb-8">
          <CardContent className="p-0">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
              {/* Product Image Carousel */}
              <div className="overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <ProductCarousel images={product.images} />
                ) : (
                  <div className="bg-neutral-200 h-96 flex items-center justify-center">
                    <span className="text-neutral-500">{t('noImage')}</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-8">
                <Badge className="mb-2 bg-cyan-500 hover:bg-cyan-600">In Stock</Badge>
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900">{l10n(product.name)}</h1>

                {product.price && <ProductPriceComponent price={product.price} />}

                <div className="mt-6 flex space-x-4">
                  <ProductActions product={product} />
                </div>

                <div className="mt-6">
                  <div className="text-sm text-neutral-500">
                    <p>SKU: {product.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frequently Bought Together - Moved outside the main card */}
        {/*
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Frequently bought together</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative h-24 w-24 border rounded-md overflow-hidden">
              <Image 
                src={product.images?.[0] || '/placeholder.jpg'} 
                alt="Single Solar" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="text-xl">+</div>
            <div className="relative h-24 w-36 border rounded-md overflow-hidden">
              <Image 
                src={product.images?.[0] || '/placeholder.jpg'} 
                alt="Twin Solar" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="text-xl">+</div>
            <div className="relative h-24 w-36 border rounded-md overflow-hidden">
              <Image 
                src="/cable.jpg" 
                alt="5m Connector" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="ml-auto">
              <div className="text-right">
                <div className="text-red-500 line-through text-sm">$456.76</div>
                <div className="text-lg font-medium">$345.75</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-neutral-700">
              <span className="font-medium">Single Solar, Twin Solar, 5m Connector</span>
            </div>
          </div>
        </CardContent>
      </Card>
      */}
        {/* Product Tabs */}
        <ProductTabsComponent product={product} />
      </div>
    </>
  );
}
