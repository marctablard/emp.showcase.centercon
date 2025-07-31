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
        className={`${isCollapsedHeader ? 'md:top-[58px] md:w-[calc(100vw-120px)]' : 'md:relative top-[calc(-100vh+55px)] md:top-[8px] md:w-auto '} absolute z-10 left-[-16px] md:left-0 w-screen md:-ml-6 md:-mr-6 p-6 bg-white/95 backdrop-blur-sm [box-shadow:inset_0_-4px_4px_0_rgba(0,0,0,0.25)] md:shadow-xl md:rounded-b-2xl`}
      >
        <div className="overflow-y-auto h-screen md:h-auto max-h-[calc(100vh-106px)] md:max-h-[calc(100vh-224px)] pb-4">
          <div className="grid grid-cols-5 gap-4">
            <QueryCompletions {...{ isProductsShown, queryCompletions, setQuery, onQuerySelect, query }} />
            {isProductsShown && <SideBar {...{ categories, query }} />}
            <div
              className={`grid auto-rows-max ${isProductsShown ? 'col-start-1 md:col-start-2' : 'col-start-1'} col-end-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:order-2`}
            >
              {productsShow.length ? (
                <>
                  {isProductsShown ? (
                    <div className="flex flex-col md:flex-row gap-4 col-span-full mb-2">
                      <Heading variant={'h5'} as="div">
                        {t('suggestedProducts')}
                      </Heading>
                      <Button variant="neutral" size="small" className="md:ml-auto" onClick={redirectToBrowse}>
                        <ArrowRight />
                        {t('showAllProducts')}
                        <ArrowRight />
                      </Button>
                    </div>
                  ) : (
                    <Heading variant={'h5'} as="div" className="col-span-full mb-2">
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
