import { useTranslations } from 'next-intl';
import { Product } from '@platform/services/model/product';
import { ProductTileListItem } from '@/components/product/product-tile-list-item';
import { ProductTileListItemSkeleton } from '@/components/product/product-tile-list-item-sekeleton';
import { SearchNoResults } from '@/components/search/search-no-results';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResultsListProps {
  products: Product[];
  locale: string;
  currentPage: number;
  pageSize: number;
  total: number;
  loading: boolean;
}

export function SearchResultsList({ products, locale, currentPage, pageSize, total, loading }: SearchResultsListProps) {
  const t = useTranslations('search');

  return (
    <>
      {loading ? (
        <>
          <Skeleton className="mb-4 h-5 w-[180px]" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: Math.min(pageSize, products.length) }).map((_, i) => (
              <ProductTileListItemSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          {products.length === 0 ? (
            <SearchNoResults />
          ) : (
            <>
              <div className="mb-4">
                <p className="text-text-placeholders text-sm">
                  {t('searchResults.showing', {
                    start: currentPage * pageSize + 1,
                    end: currentPage * pageSize + products.length,
                    total: total,
                  })}
                </p>
              </div>

              {/* Client-side rendered products - this will replace the server-rendered ones */}
              <div className="flex flex-col gap-4">
                {products.map((product) => (
                  <div key={product.id} className="h-full">
                    <ProductTileListItem product={product} locale={locale} />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
