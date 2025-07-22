'use client';

import React, { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { CheckCircle2, FlipHorizontal2, LucideArrowDown, LucideCopy, Pin, Share2, Sun } from 'lucide-react';
import { ProductCarousel } from '@/components/product/product-carousel';
import { Badge } from '@/components/ui/badge';
import { BulletPoint } from '@/components/ui/bullet-point';
import { Card, CardContent } from '@/components/ui/card';
import { useProduct } from '@/hooks/product/useProduct';
import { useBreakpoint } from '@/hooks/useBreakpoint';
// import { useRecommendations } from '@/hooks/recommendations/useRecommendations';
import { useL10n } from '@/hooks/useL10n';
import { cn } from '@/lib/utils';
import { ProductPrice } from '@/platform/services/model/price';
import { GroupedSpecification, Product } from '@/platform/services/model/product';
import Recommendations from '../cms/recommendations';
import { Button } from '../ui/button';
import { H1, H2, H3, H5 } from '../ui/h';
import UiLink from '../ui/link';
import { RatingStarRow } from '../ui/rating';
import ProductAddToCart from './product-add-to-cart';
import { ProductPriceComponent } from './product-price';
import { ProductShippingInfo } from './product-shipping-info';

export interface ProductDetailProps {
  product?: Product;
  price?: ProductPrice | null;
  className?: string;
}

export default function ProductDetail({ product: initialProduct, price, className }: ProductDetailProps) {
  const { product, loading, setAsCurrent } = useProduct(initialProduct);
  const locale = useLocale();
  const { l10n } = useL10n(locale);
  const t = useTranslations('product');
  const currentLocale = useLocale();
  const isDesktopScreen = useBreakpoint('lg');
  //   const { recommendations, loading: recLoading } = useRecommendations(product?.id);

  useEffect(() => {
    if (product) {
      setAsCurrent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (loading) {
    return <div>Loading</div>;
  }
  if (!product) {
    return <div>Product not found</div>;
  }
  return (
    <>
      <div className={cn('grid grid-cols-1 gap-x-4 lg:gap-x-12 2xl:gap-x-29 lg:grid-cols-2', className)}>
        <>
          <Card variant="gray" className="row-start-3 lg:col-start-1 lg:row-start-1 lg:row-end-4 p-6 lg:p-8 mb-6">
            <CardContent className="px-0">
              {/* Product Image Carousel */}
              <div className="overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <ProductCarousel images={product.images} />
                ) : (
                  <div className="bg-neutral-200 flex items-center justify-center">
                    <Image src={'/images/no_image_alt.png'} alt={l10n(product.name)} width={90} height={90} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-start-1">
            <Card variant="primary" className="p-4 lg:px-8 lg:pb-8 lg:pt-6 mb-10 lg:mb-0">
              <CardContent className="p-0">
                <div className="flex flex-col gap-6">
                  <h2 className="text-white text-4xl font-bold font-headlines">{t('keySpecs')}</h2>
                  <div className="grid grid-cols-1 grid-rows-3 xl:grid-cols-2 gap-y-6 gap-x-12">
                    <BulletPoint
                      className="font-bold"
                      label="Nominal Power"
                      variant="white"
                      iconColor="white"
                      iconSize={'lg'}
                      value={product.mixins?.productVariantAttributes?.['nominal-power']}
                    />
                    <BulletPoint
                      className="font-bold"
                      label="Length"
                      variant="white"
                      iconColor="white"
                      iconSize={'lg'}
                      value={product.mixins?.productTemplateAttributes?.['length']}
                    />
                    <BulletPoint
                      className="font-bold"
                      label="Solar Panel Type"
                      variant="white"
                      iconColor="white"
                      iconSize={'lg'}
                      value="Solar Panel"
                    />
                    <BulletPoint
                      className="font-bold"
                      label="Width"
                      variant="white"
                      iconColor="white"
                      iconSize={'lg'}
                      value={product.mixins?.productTemplateAttributes?.['width']}
                    />
                    <BulletPoint
                      className="font-bold"
                      label="Cell Type"
                      variant="white"
                      iconColor="white"
                      iconSize={'lg'}
                      value={product.mixins?.productTemplateAttributes?.['cell-type']}
                    />
                    <BulletPoint
                      className="font-bold"
                      label="Height"
                      variant="white"
                      iconColor="white"
                      iconSize={'lg'}
                      value={product.mixins?.productTemplateAttributes?.['height']}
                    />
                  </div>

                  <div className="flex items-center mt-2">
                    <button className="text-white flex items-center gap-1">
                      <UiLink type="Link" className="text-white hover:text-white">
                        {t('more')}
                      </UiLink>
                      <LucideArrowDown />
                    </button>
                  </div>

                  <div className="flex items-center mt-2">
                    <span className="text-white font-bold">{t('itemNumber')}:</span>
                    <span className="text-primary ml-2 bg-white bg-opacity-20 py-2 px-3 rounded flex items-center">
                      <p className="me-2">{product.id}</p>
                      <LucideCopy aria-label={t('copy')} />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="my-6">
              <H5>{t('otherVariants')}</H5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-2 2xl:grid-cols-3 rounded-sm border-2 border-primary-500">
                  <div className="col-start-1 bg-neutral-50 p-4">
                    <div className="w-[108px] h-[68px]">
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText ? l10n(product.images[0].altText) : `Product image`}
                          width="100"
                          height="50"
                          className="object-center w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-start2 p-6 flex flex-col justify-center">
                    <div className="flex gap-2 items-center">
                      <p>410W</p>
                      <CheckCircle2 className="text-success-500 w-4 h-4" />
                    </div>
                    <p className="text-xs text-neutral-500">459.99 €</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-2 2xl:grid-cols-3 rounded-sm border-2 border-neutral-50">
                  <div className="col-start-1 bg-neutral-50 p-4">
                    <div className="w-[108px] h-[68px]">
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText ? l10n(product.images[0].altText) : `Product image`}
                          width="100"
                          height="50"
                          className="object-center w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-start2 p-6 flex flex-col justify-center">
                    <div className="flex gap-2 items-center">
                      <p>380W</p>
                      <CheckCircle2 className="text-success-500 w-4 h-4" />
                    </div>
                    <p className="text-xs text-neutral-500">429.99 €</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-2 2xl:grid-cols-3 rounded-sm border-2 border-neutral-50">
                  <div className="col-start-1 bg-neutral-50 p-4">
                    <div className="w-[108px] h-[68px]">
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText ? l10n(product.images[0].altText) : `Product image`}
                          width="100"
                          height="50"
                          className="object-center w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-start2 p-6 flex flex-col justify-center">
                    <div className="flex gap-2 items-center">
                      <p>350W</p>
                      <CheckCircle2 className="text-success-500 w-4 h-4" />
                    </div>
                    <p className="text-xs text-neutral-500">400.00 €</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-2 2xl:grid-cols-3 rounded-sm border-2 border-neutral-50">
                  <div className="col-start-1 bg-neutral-50 p-4">
                    <div className="w-[108px] h-[68px]">
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText ? l10n(product.images[0].altText) : `Product image`}
                          width="100"
                          height="50"
                          className="object-center w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-start2 p-6 flex flex-col justify-center">
                    <div className="flex gap-2 items-center">
                      <p>300W</p>
                      <CheckCircle2 className="text-success-500 w-4 h-4" />
                    </div>
                    <p className="text-xs text-neutral-500">349.99 €</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
        <div className="lg:col-start-2 row-start-1 h-6">
          <div>
            <div className="flex justify-between">
              <div className="flex gap-2">
                {product.labels?.map((label) => (
                  <Badge key={label.id} variant="info" rounded="rounded_right" className="h-7">
                    {label.name}
                  </Badge>
                ))}
              </div>
              {isDesktopScreen && (
                <div className="flex gap-2">
                  <Button size="icon" variant="secondary" aria-label="icon">
                    <FlipHorizontal2 />
                  </Button>
                  <Button size="icon" variant="secondary" aria-label="icon">
                    <Pin />
                  </Button>
                  <Button size="icon" variant="secondary" aria-label="icon">
                    <Share2 />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row-start-2 lg:col-start-2 lg:row-start-2">
          {/* <div>
                {product.brand && (
                  <Overline className="flex items-center gap-2">
                    {product.brand.logo && (
                      <Image src={product.brand.logo?.url} alt={l10n(product.brand.name)} height={70} width={70} />
                    )}
                    <span>{l10n(product.brand.name)}</span>
                  </Overline>
                )}
              </div> */}
          <p className="mb-2 mt-4 lg:mt-0 text-primary-500 font-bold font-headlines">Bluetti</p>
          <H1>{l10n(product.name)}</H1>
          <div className="mb-6 lg:md-0 flex gap-2 items-center">
            <p className="text-neutral-600 font-bold">4.6</p>
            <RatingStarRow starsCount={5} filledCount={4} className="py-2" />
            <p className="text-neutral-600 text-sm">(114)</p>
          </div>
        </div>
        <div className="row-start-4 lg:col-start-2 lg:row-start-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            <div className="col-start-1 md:row-start-1 lg:col-end-4 xl-col-end-5">
              {price && <ProductPriceComponent price={price} />}
            </div>
            <ProductAddToCart product={product} price={price} className="mt-6" />
          </div>
          {!isDesktopScreen && (
            <div className="flex justify-center gap-2 mt-6">
              <Button size="icon" variant="secondary" aria-label="icon">
                <FlipHorizontal2 />
              </Button>
              <Button size="icon" variant="secondary" aria-label="icon">
                <Pin />
              </Button>
              <Button size="icon" variant="secondary" aria-label="icon">
                <Share2 />
              </Button>
            </div>
          )}
          <ProductShippingInfo />
        </div>

        <div className="row-start-5 lg:col-start-2 lg:row-start-4 mt-8 lg:mt-0">
          <div
            className="text-xl text-neutral lg:mt-6"
            dangerouslySetInnerHTML={{ __html: l10n(product.description) }}
          />
          {product.mixins.highlights.highlights && (
            <div className="mt-10 lg:mt-16">
              <H2 variant="h3" className="text-primary mb-8">
                {t('productHighlights')}
              </H2>
              <div className="mb-10 lg:mb-0">
                {product.mixins.highlights.highlights.map((highlight: any) =>
                  highlight.map(
                    (hl: any) =>
                      hl.language === currentLocale && (
                        <BulletPoint
                          key={hl.value}
                          label={hl.value}
                          iconColor="primary"
                          variant="default"
                          size="lg"
                          icon={Sun}
                          className="mb-6 gap-4"
                        />
                      ),
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {product?.groupedSpecifications && (
        <div className={cn(className)}>
          <H3 className="my-6"> {t('technicalInformation')}</H3>
          <div className="grid grid-cols-1 gap-y-6 lg:gap-y-16 gap-x-6 lg:grid-cols-2 xl:grid-cols-4 mb-16">
            {product.groupedSpecifications.map((spec: GroupedSpecification, index) => {
              return (
                <div className="flex flex-col" key={index}>
                  <p className="font-bold font-headlines font-sm p-4 border-b border-neutral-200">
                    {l10n(spec.groupName)}
                  </p>
                  {spec.item.map((i) => (
                    <div className="font-sm p-4 border-b border-neutral-200 flex gap-4" key={l10n(i.label)}>
                      <p className="w-1/2">{l10n(i.label)}</p>
                      <p className="w-1/2">
                        {l10n(i.value)} {l10n(i.unit)}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Recommendations
        blok={{
          productId: product.id,
          locale,
          overline: t('productRecommendations.overline'),
          headline: t('productRecommendations.headline'),
        }}
      />
    </>
  );
}
