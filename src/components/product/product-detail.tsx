'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { LucideChevronDown, LucideCopy, Sun } from 'lucide-react';
import { ProductCarousel } from '@/components/product/product-carousel';
import { Badge } from '@/components/ui/badge';
import { BulletPoint } from '@/components/ui/bullet-point';
import { Card, CardContent } from '@/components/ui/card';
import { useProduct } from '@/hooks/product/useProduct';
import { useL10n } from '@/hooks/useL10n';
import { ProductPrice } from '@/platform/services/model/price';
import { Product } from '@/platform/services/model/product';
import { H1, H2, Overline } from '../ui/h';
import UiLink from '../ui/link';
import ProductAddToCart from './product-add-to-cart';
import { ProductPriceComponent } from './product-price';
import { ProductShippingInfo } from './product-shipping-info';
import { ProductTabsComponent } from './product-tabs';

export interface ProductDetailProps {
  product?: Product;
  price?: ProductPrice | null;
}

interface Highlight {
  id: string;
  label: string;
}

export const exampleHighlights: Highlight[] = [
  {
    id: '1',
    label: 'Safety assembly with microbubble separator included as standard',
  },
  {
    id: '2',
    label: 'Includes hydraulic module for the easiest installation',
  },
  {
    id: '3',
    label: 'Eligible for funding thanks to BAFA listing',
  },
  {
    id: '4',
    label: '5G-Ready',
  },
  {
    id: '5',
    label: 'Efficiency display integrated',
  },
  {
    id: '6',
    label: 'Night reduction programmable for quiet operation',
  },
  {
    id: '7',
    label: 'Integrated Wi-Fi controllable via SmartLife app',
  },
  {
    id: '8',
    label: 'Modbus interface',
  },
];

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
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
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
                <BulletPoint label="Cooling capacity" variant="white" iconColor="white" value="7.1kW" />
                <BulletPoint
                  label="Heating power"
                  variant="white"
                  iconColor="white"
                  value={
                    <span>
                      <span className="bg-green-600 text-white px-1 mr-1 rounded">A</span>7.2kW
                    </span>
                  }
                />
                <BulletPoint label="Operating voltage" variant="white" iconColor="white" value="230V/1~/50Hz" />
                <BulletPoint label="Operating mode" variant="white" iconColor="white" value="Cooling & Heating" />
                <BulletPoint label="Refrigerant" variant="white" iconColor="white" value="R290" />
                <BulletPoint label="Sound power level" variant="white" iconColor="white" value="58 dB(A)" />
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
                <span className="text-white text-sm">{t('itemNumber')}:</span>
                <span className="text-primary ml-2 bg-white bg-opacity-20 px-2 py-1 rounded flex items-center">
                  {product.sku}
                  <LucideCopy aria-label={t('copy')} />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <div className="flex gap-2 mb-6">
          {product.labels?.map((label) => (
            <Badge key={label.id} variant="warning" rounded="none">
              {label.name}
            </Badge>
          ))}
        </div>
        {/* Product Details */}
        <div>
          {product.brand && (
            <Overline className="flex items-center gap-2">
              {product.brand.logo && (
                <Image src={product.brand.logo?.url} alt={l10n(product.brand.name)} height={70} width={70} />
              )}
              <span>{l10n(product.brand.name)}</span>
            </Overline>
          )}
          <H1>{l10n(product.name)}</H1>

          {price && <ProductPriceComponent price={price} />}

          <ProductAddToCart product={product} className="mt-6" />

          <ProductShippingInfo />

          <div className="text-lg text-neutral-500 mt-6">
            <p dangerouslySetInnerHTML={{ __html: product.description }}></p>
          </div>

          <div className="mt-16">
            <H2 variant="h2" className="text-primary mb-6">
              {t('productHighlights')}
            </H2>
            <div className="">
              {exampleHighlights.map((highlight) => (
                <BulletPoint
                  key={highlight.id}
                  label={highlight.label}
                  iconColor="primary"
                  variant="default"
                  size="lg"
                  icon={Sun}
                  className="mb-6"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
