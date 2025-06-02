import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useL10n } from '@/hooks/useL10n';
import { imageSizes } from '@/lib/utils';
import { Product } from '@/platform/services/model/product';

interface ProductTileProps {
  product: Product;
  className?: string;
  locale?: string;
}

export function ProductTile({ product, locale = 'en' }: ProductTileProps) {
  const { l10n } = useL10n(locale);

  return (
    <Link href={`/product/${product.id}`}>
      <Card>
        <div className="relative aspect-square bg-gray-100 rounded-sm no-underline">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage.url}
              alt={product.primaryImage.altText ? l10n(product.primaryImage.altText) : l10n(product.name)}
              fill
              sizes={imageSizes}
              className="object-contain object-center"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <CardHeader className="flex-shrink-0 no-underline">
          <CardTitle className="font-normal">{l10n(product.name)}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="font-semibold">
            {product.price ? `$${product.price.amount?.toFixed(2) || 'Price unavailable'}` : 'Price unavailable'}
          </p>
        </CardContent>
        <CardFooter className="flex-shrink-0 pt-4">
          <p className="text-sm text-gray-500 line-clamp-3">{l10n(product.description)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function ProductTileSkeleton() {
  return (
    <Card className="overflow-hidden h-full w-full flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        <div className="animate-pulse bg-gray-200 h-full w-full" />
      </div>
      <CardHeader className="flex-shrink-0">
        <div className="animate-pulse bg-gray-200 h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="animate-pulse bg-gray-200 h-4 w-full mb-2" />
        <div className="animate-pulse bg-gray-200 h-4 w-3/4 mb-2" />
        <div className="animate-pulse bg-gray-200 h-4 w-1/2" />
      </CardContent>
      <CardFooter className="flex-shrink-0 border-t pt-4">
        <div className="animate-pulse bg-gray-200 h-5 w-1/4" />
      </CardFooter>
    </Card>
  );
}
