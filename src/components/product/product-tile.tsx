import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Feather, Hourglass, MapPin, Pin, ShoppingCart, Trees, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { ProductCharacteristic } from '@/components/product/product-characteristic';
import { ProductTag } from '@/components/product/product-tag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { H6 } from '@/components/ui/h';
import { useCart } from '@/hooks/cart/useCart';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import { useL10n } from '@/hooks/useL10n';
import { imageSizes } from '@/lib/utils';
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
      <Card shadow="default" className="gap-4 h-full flex flex-col">
        <CardHeader className="flex-shrink-0 no-underline flex-grow">
          <CardDescription className="font-normal text-base text-neutral-800">
            {l10n(product.brand?.name || 'Allen Key Type')}
          </CardDescription>
          <CardTitle className="flex gap-2 justify-between">
            <H6>{l10n(product.name)}</H6>
            <Button variant="secondary" size="icon" className="h-[50px] w-[50px]">
              <Pin width="24" height="24" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="relative bg-neutral-50 no-underline py-4 gap-8 justify-end rounded-tl-lg rounded-br-lg flex flex-col align-middle h-64">
            {product.primaryImage ? (
              <div className="relative w-40 h-20 max-w-40 max-h-20 self-center">
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

            <div className="flex flex-row gap-2 justify-end px-4">
              {/* Todo: read characteristics from product */}
              <ProductCharacteristic value={200} unit={'W'} />
              <ProductCharacteristic value={250} unit={'W'} />
              <ProductCharacteristic value={300} unit={'W'} />
            </div>

            <div className="flex flex-col gap-2 -ml-6 absolute top-4">
              {/* Todo: read labels from product */}
              {/*{product.labels?.map((label) => (*/}
              <Badge key={0} variant="black" rounded="rounded_right">
                BLACK FRIDAY
              </Badge>
              <Badge key={1} variant="promo" rounded="rounded_right">
                MEMBER DEAL
              </Badge>
              {/*))}*/}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-full">
              {/* Todo: read specs from product */}
              <div className="flex justify-between">
                <p className="text-sm">Length</p>
                <p className="text-sm font-bold">148cm</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Width</p>
                <p className="text-sm font-bold">67cm</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Cell type</p>
                <p className="text-sm font-bold">Monocrystalline</p>
              </div>
            </div>
            <div ref={horizontalScrollRef} className="flex gap-2 max-w-full overflow-x-scroll hide-scrollbar">
              <ProductTag icon={Feather} text="Light weight" />
              <ProductTag icon={Trees} text="Sustainable" />
              <ProductTag icon={Hourglass} text="Durable" />
              <ProductTag icon={Hourglass} text="Durable" />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          {/*<p className="text-sm text-neutral-500 line-clamp-3">{l10n(product.description)}</p>*/}
          <div className="flex flex-col gap-1 w-full">
            <div className="flex gap-2 text-success-500">
              {/* Todo: read availability from product */}
              <Truck />
              <p>Online Available</p>
            </div>
            <div className="flex gap-2 text-success-500">
              {/* Todo: read pickup availability from product */}
              <MapPin />
              <p>Can be reserved London, NW1 6XE</p>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col gap-1">
                {/* Todo: read prices from product */}
                {/* {product.price ? `$${product.price.amount?.toFixed(2) || 'Price unavailable'}` : 'Price unavailable'} */}
                <p className="line-through">€12.00</p>
                <p className="text-xl text-danger-500 font-bold">€10.00</p>
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
