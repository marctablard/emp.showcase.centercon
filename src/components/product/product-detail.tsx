'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LucideChevronDown, LucideCopy } from 'lucide-react';
import { ProductCarousel } from '@/components/product/product-carousel';
import { Badge } from '@/components/ui/badge';
import { BulletPoint } from '@/components/ui/bullet-point';
import { Card, CardContent } from '@/components/ui/card';
import { useProduct } from '@/hooks/product/useProduct';
import { useL10n } from '@/hooks/useL10n';
import { ProductPrice } from '@/platform/services/model/price';
import { Product } from '@/platform/services/model/product';
import UiLink from '../ui/link';
import ProductActions from './product-actions';
import { ProductPriceComponent } from './product-price';
import { ProductTabsComponent } from './product-tabs';

export interface ProductDetailProps {
  product?: Product;
  price?: ProductPrice | null;
}

export default function ProductDetail({ product: initialProduct, price }: ProductDetailProps) {
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
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div>
        <Card variant="gray">
          <CardContent>
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
          </CardContent>
        </Card>
        <Card variant="primary" className="mt-4">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-white text-3xl font-bold mb-4">410W</h2>
              <div className="grid grid-cols-1 grid-rows-3 md:grid-cols-2 gap-4">
                <BulletPoint label="Cooling capacity" value="7.1kW" />
                <BulletPoint
                  label="Heating power"
                  value={
                    <span>
                      <span className="bg-green-600 text-white px-1 mr-1 rounded">A</span>7.2kW
                    </span>
                  }
                />
                <BulletPoint label="Operating voltage" value="230V/1~/50Hz" />
                <BulletPoint label="Operating mode" value="Cooling & Heating" />
                <BulletPoint label="Refrigerant" value="R290" />
                <BulletPoint label="Sound power level" value="58 dB(A)" />
              </div>

              <div className="flex items-center mt-2">
                <button className="text-white flex items-center gap-1">
                  <UiLink type="Link" className="text-white">
                    More product features
                  </UiLink>
                  <LucideChevronDown />
                </button>
              </div>

              <div className="flex items-center mt-2">
                <span className="text-white text-sm">Item number:</span>
                <span className="text-primary ml-2 bg-white bg-opacity-20 px-2 py-1 rounded flex items-center">
                  {product.sku}
                  <LucideCopy aria-label="Copy" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="m-3">
        {/* Product Details */}
        <div className="p-8">
          <Badge className="mb-2 bg-cyan-500 hover:bg-cyan-600">In Stock</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">{l10n(product.name)}</h1>

          {price && <ProductPriceComponent price={price} />}

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
      {/* Product Tabs */}
      <ProductTabsComponent product={product} />
    </div>
  );
}
