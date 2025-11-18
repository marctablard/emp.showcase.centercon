import React, { Dispatch, SetStateAction, forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { ProductTileFlyOut } from '@/components/product/product-tile-fly-out';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/h';
import useHistory from '@/hooks/history/useHistory';
import { SearchSuggestions } from '@/platform/services/model/search';
import { NoResults } from './no-results';
import { QueryCompletions } from './query-completions';
import { SideBar } from './side-bar';

export interface SearchResultFlyOutProps {
  suggestions: SearchSuggestions;
  hasInitialSearch: boolean;
  locale: string;
  query: string;
  loading: boolean;
  setQuery: Dispatch<SetStateAction<string>>;
  onProductClick?: () => void;
  onQuerySelect?: (query: string) => void;
  redirectToBrowse?: () => void;
  isCollapsedHeader?: boolean;
}

export const SearchFlyOut = forwardRef<HTMLDivElement, SearchResultFlyOutProps>(
  (
    {
      suggestions: { categories, queryCompletions, products },
      loading,
      query,
      hasInitialSearch,
      locale,
      setQuery,
      onProductClick,
      onQuerySelect,
      redirectToBrowse,
      isCollapsedHeader,
    },
    ref,
  ) => {
    const { lastSeenProducts } = useHistory();
    const t = useTranslations('layout.header');
    const isProductsShown = query.length > 2;
    const productsShow = isProductsShown ? products : lastSeenProducts;

    return (
      <section
        ref={ref}
        className={`${isCollapsedHeader ? 'sm:top-[58px] sm:w-[calc(100vw-120px)]' : 'sm:relative top-[calc(-100vh+55px)] sm:top-[8px] sm:w-auto '} absolute z-10 left-[-16px] sm:left-0 w-screen sm:-ml-6 sm:-mr-6 p-6 bg-surface-page/95 backdrop-blur-default [box-shadow:inset_0_-4px_4px_0_rgba(0,0,0,0.25)] sm:shadow-sm sm:rounded-b-lg`}
      >
        <div className="overflow-y-auto h-screen sm:h-auto max-h-[calc(100vh-106px)] sm:max-h-[calc(100vh-224px)] pb-4">
          <div className="grid grid-cols-5 gap-4">
            <QueryCompletions {...{ isProductsShown, queryCompletions, setQuery, onQuerySelect, query }} />
            {isProductsShown && <SideBar {...{ categories, query }} />}
            <div
              className={`grid auto-rows-max ${isProductsShown ? 'col-start-1 sm:col-start-2' : 'col-start-1'} col-end-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:order-2`}
            >
              {productsShow.length ? (
                <>
                  {isProductsShown ? (
                    <div className="flex flex-col sm:flex-row gap-4 col-span-full mb-2">
                      <Heading variant="h5" as="div">
                        {t('suggestedProducts')}
                      </Heading>
                      <Button variant="neutral" size="small" className="sm:ml-auto" onClick={redirectToBrowse}>
                        <ArrowRight />
                        {t('showAllProducts')}
                        <ArrowRight />
                      </Button>
                    </div>
                  ) : (
                    <Heading variant="h5" as="div" className="col-span-full mb-2">
                      {t('lastSeenProducts')}
                    </Heading>
                  )}
                  {productsShow.map((product) => (
                    <ProductTileFlyOut
                      key={product.id}
                      locale={locale}
                      product={product}
                      onProductClick={onProductClick}
                      keyword={isProductsShown ? query : undefined}
                    />
                  ))}
                </>
              ) : (
                hasInitialSearch && !loading && <NoResults {...{ queryCompletions, setQuery, onQuerySelect }} />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  },
);

SearchFlyOut.displayName = 'SearchFlyOut';

export default SearchFlyOut;
