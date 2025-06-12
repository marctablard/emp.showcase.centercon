'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ProductCarousel } from '@/components/product/product-carousel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useProduct } from '@/hooks/product/useProduct';
import { useL10n } from '@/hooks/useL10n';
import { Product } from '@/platform/services/model/product';
import ProductActions from './product-actions';
import { ProductPriceComponent } from './product-price';
import { ProductTabsComponent } from './product-tabs';

export default function ProductDetail({ product: initialProduct }: { product?: Product }) {
  const { product, loading, setAsCurrent } = useProduct(initialProduct);
  const locale = useLocale();
  const { l10n } = useL10n(locale);
  const t = useTranslations('product');

  if (loading) {
    return <div>Loading</div>;
  }
  if (!product) {
    return <div>Product not found</div>;
  }
  // set as current Product, when we display the details
  setAsCurrent();

  return (
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
      {/* Product Tabs */}
      <ProductTabsComponent product={product} />
    </div>
  );
}
