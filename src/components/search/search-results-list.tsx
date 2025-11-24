import { useTranslations } from 'next-intl';
import { Product } from '@platform/services/model/product';
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
          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {/*Todo: add skeleton here*/}
            {/*{Array.from({ length: Math.min(pageSize, products.length) }).map((_, i) => (*/}
            {/*  <ProductTileSkeleton key={i} />*/}
            {/*))}*/}
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
              <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {products.map((product) => (
                  <div key={product.id} className="h-full">
                    {/* Todo: add product list item here */}
                    {/*<ProductTile product={product} locale={locale} />*/}
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
