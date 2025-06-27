import React, { Dispatch, SetStateAction, forwardRef } from 'react';
import { ProductTileFlyOut } from '@/components/product/product-tile-fly-out';
import { Headline } from '@/components/ui/headline';
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
}

export const SearchFlyOut = forwardRef<HTMLDivElement, SearchResultFlyOutProps>(
  (
    { suggestions: { categories, queryCompletions, products }, loading, query, hasInitialSearch, locale, setQuery },
    ref,
  ) => {
    const { lastSeenProducts } = useHistory();
    const isProductsShown = query.length > 2;
    const productsShow = isProductsShown ? products : lastSeenProducts;

    return (
      <section ref={ref} className="absolute z-10 w-full mt-1 bg-white p-9 rounded-b-lg grid grid-cols-5">
        <QueryCompletions {...{ isProductsShown, queryCompletions, setQuery }} />
        {isProductsShown && <SideBar {...{ categories, query }} />}
        <div className="grid auto-rows-max grid-cols-subgrid gap-6 col-start-2 col-end-6">
          {productsShow.length ? (
            <>
              <Headline className="col-span-full" variant={'h5'}>
                {isProductsShown ? 'Suggested Products' : 'Last seen Products'}
              </Headline>
              {productsShow.map((product) => (
                <ProductTileFlyOut key={product.id} locale={locale} product={product} />
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
