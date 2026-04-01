'use client';

import { ProductTile } from '@/components/product/product-tile';
import { ProductTileSkeleton } from '@/components/product/product-tile-skeleton';
import { Product } from '@/platform/services/model/product';

interface CategoryProductGridProps {
  products: Product[];
  locale?: string;
}

export function CategoryProductGrid({ products, locale = 'en' }: CategoryProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductTileSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductTile key={product.id} product={product} locale={locale} skipVariantFetch />
      ))}
    </div>
  );
}
