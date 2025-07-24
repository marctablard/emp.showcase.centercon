import React, { Dispatch, SetStateAction, forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { ProductTileFlyOut } from '@/components/product/product-tile-fly-out';
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
    },
    ref,
  ) => {
    const { lastSeenProducts } = useHistory();
    const t = useTranslations('layout.header');
    const isProductsShown = query.length > 2;
    const productsShow = isProductsShown ? products : lastSeenProducts;

    return (
      <section ref={ref} className="absolute z-10 w-full mt-1 bg-white p-9 rounded-b-lg grid grid-cols-5">
        <QueryCompletions {...{ isProductsShown, queryCompletions, setQuery, onQuerySelect }} />
        {isProductsShown && <SideBar {...{ categories, query }} />}
        <div className="grid auto-rows-max grid-cols-subgrid gap-4 col-start-2 col-end-6 grid-cols-2 lg:grid-cols-3 ">
          {productsShow.length ? (
            <>
              <Heading className="col-span-full" variant={'h5'} as="div">
                {isProductsShown ? t('suggestedProducts') : t('lastSeenProducts')}
              </Heading>
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
            hasInitialSearch && !loading && <NoResults {...{ queryCompletions }} />
          )}
        </div>
      </section>
    );
  },
);

SearchFlyOut.displayName = 'SearchFlyOut';

export default SearchFlyOut;
