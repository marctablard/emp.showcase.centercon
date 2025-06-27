import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Feather, MapPin, Pin, ShoppingCart, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { ProductCharacteristic } from '@/components/product/product-characteristic';
import { ProductTag } from '@/components/product/product-tag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { H5, H6 } from '@/components/ui/h';
import { useCart } from '@/hooks/cart/useCart';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import { useL10n } from '@/hooks/useL10n';
import { formatCurrency, imageSizes } from '@/lib/utils';
import { Product } from '@/platform/services/model/product';

interface ProductTileProps {
  product: Product;
  locale?: string;
}

export function ProductTile({ product, locale = 'en' }: ProductTileProps) {
  const t = useTranslations('product');
  const { l10n } = useL10n(locale);
  const { addItem, loading: cartLoading } = useCart();
  const horizontalScrollRef = useHorizontalScroll();

  const handleAddToCart = async (e: any) => {
    try {
      e.stopPropagation();
      e.preventDefault();

      if (!product) return;

      await addItem(product.id, 1);

      toast.success(t('addedToCart'), {
        description: `${product.name} ${t('addedToCartDescription')}`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('errorAddingToCart'), {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="h-full block">
      <Card shadow="default" className="gap-4 h-full flex flex-col hover:shadow-xl transition">
        <CardHeader className="flex-shrink-0 no-underline">
          <CardDescription className="font-normal text-base text-neutral-800">
            {l10n(
              product.brand?.name ||
                product.specifications?.find((spec) => spec.key === 'manufacturer')?.value ||
                'Allen Key Type',
            )}
          </CardDescription>
          <CardTitle className="flex gap-2 justify-between">
            <H5 className="lg:hidden">
              <p className="line-clamp-3">{l10n(product.name)}</p>
            </H5>
            <H6 className="hidden lg:block">
              <p className="line-clamp-2">{l10n(product.name)}</p>
            </H6>
            <Button variant="secondary" size="icon" className="h-[50px] w-[50px] flex-shrink-0">
              <Pin width="24" height="24" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 flex-grow">
          <div className="relative bg-neutral-50 p-4">
            <div className="relative aspect-square rounded-tl-lg rounded-br-lg p-4">
              {product.primaryImage ? (
                <div className="relative w-full h-full">
                  <Image
                    src={product.primaryImage.url}
                    alt={product.primaryImage.altText ? l10n(product.primaryImage.altText) : l10n(product.name)}
                    fill
                    sizes={imageSizes}
                    className="object-contain object-center"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-neutral-400">No image</span>
                </div>
              )}
            </div>

            <div className="absolute right-4 bottom-4 flex flex-row gap-2 justify-end">
              {/* Todo: read characteristics from product */}
              <ProductCharacteristic value={200} unit={'W'} />
              <ProductCharacteristic value={250} unit={'W'} />
              <ProductCharacteristic value={300} unit={'W'} />
            </div>

            <div className="flex flex-col gap-2 absolute top-4 -left-6">
              {/* Todo: read labels from product */}
              {/*{product.labels?.map((label) => (*/}
              {/* Mock labels - randomly selected based on product ID */}
              {(() => {
                // Use product ID to generate consistent but random labels for each product
                const productIdSum = product.id?.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) || 0;
                const showBlackFriday = productIdSum % 2 === 0;
                const showMemberDeal = productIdSum % 3 === 0;

                return (
                  <>
                    {showBlackFriday && (
                      <Badge key="blackfriday" variant="black" rounded="rounded_right">
                        BLACK FRIDAY
                      </Badge>
                    )}
                    {showMemberDeal && (
                      <Badge key="memberdeal" variant="promo" rounded="rounded_right">
                        MEMBER DEAL
                      </Badge>
                    )}
                  </>
                );
              })()}
              {/*))}*/}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {product.templateAttributes && (
              <div className="w-full">
                {/* Todo: read specs from product */}
                <div className="flex justify-between">
                  <p className="text-sm">Length</p>
                  <p className="text-sm font-bold">{product.templateAttributes?.width}cm</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">Width</p>
                  <p className="text-sm font-bold">{product.templateAttributes?.width}cm</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">Cell type</p>
                  <p className="text-sm font-bold">{product.templateAttributes?.['cell-type']}</p>
                </div>
              </div>
            )}
            <div ref={horizontalScrollRef} className="flex gap-2 max-w-full overflow-x-scroll hide-scrollbar">
              {product.usps?.map((usp) => (
                // Todo: map Icon
                <ProductTag icon={Feather} text={l10n(usp.description)} key={l10n(usp.description)} />
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex gap-2 text-success-500 text-sm items-center">
              {/* Todo: read availability from product */}
              <Truck />
              <p>Online Available</p>
            </div>
            <div className="flex gap-2 text-success-500 text-sm items-center">
              {/* Todo: read pickup availability from product */}
              <MapPin />
              <p>Can be reserved London, NW1 6XE</p>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                {product.price ? (
                  product.price.originalAmount && product.price.originalAmount !== product.price.amount ? (
                    <>
                      <p className="line-through">
                        {formatCurrency(product.price.originalAmount, product.price.currency)}
                      </p>
                      <p className="text-xl/5 text-danger-500 font-bold">
                        {formatCurrency(product.price.amount, product.price.currency)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xl/5 font-bold">
                      {formatCurrency(product.price.amount, product.price.currency)}
                    </p>
                  )
                ) : (
                  <p className="text-xl/5 font-bold">Price not available</p>
                )}
              </div>
              <Button
                size="icon"
                className="h-[50px] w-[50px] self-end"
                onClick={(e) => handleAddToCart(e)}
                disabled={cartLoading}
              >
                <ShoppingCart width="24" height="24" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
