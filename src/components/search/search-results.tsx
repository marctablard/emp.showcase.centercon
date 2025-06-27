'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ProductTile } from '@/components/product/product-tile';
import { ProductTileSkeleton } from '@/components/product/product-tile-skeleton';
import { SearchFilter } from '@/components/search/search-filter';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useSearch } from '@/hooks/useSearch';
import { SearchParams, SearchResult } from '@/platform/services/model/common';
import { Product } from '@/platform/services/model/product';

interface SearchClientWrapperProps {
  initialSearch?: SearchParams<Product>;
  initialResults?: SearchResult<Product>;
  locale: string;
}

export function SearchResultsComponent({ initialSearch, initialResults, locale }: SearchClientWrapperProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  // Initialize the search hook with Product type and initial results
  const {
    data: products,
    loading,
    total,
    facets: availableFilters,
    currentPage,
    pageSize,
    search,
    applyFacet,
    applyRangeFacet,
    resetFacet,
    resetAllFacets,
    activeFilters,
    changePage,
  } = useSearch<Product>(initialSearch, initialResults);
  const [visiblePagination, setVisibilePagination] = useState<number[]>([]);

  useEffect(() => {
    search({
      query: searchParams.get('q') ?? '',
      page: currentPage,
      size: pageSize,
    });
  }, [searchParams, currentPage, pageSize, search]);

  useEffect(() => {
    const totalPages = Math.ceil(total / pageSize);
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    setVisibilePagination(Array.from({ length: end - start + 1 }, (_, i) => start + i));
  }, [currentPage, total, pageSize]);

  return (
    <>
      <SearchFilter {...{ activeFilters, availableFilters, resetFacet, resetAllFacets, applyFacet, applyRangeFacet }} />
      {/* Product Grid */}
      <div className="w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
            {Array.from({ length: Math.min(pageSize, products.length) }).map((_, i) => (
              <ProductTileSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium mb-2">{t('searchResults.noProductsFound')}</h2>
                <p className="text-neutral-500">{t('searchResults.tryAdjusting')}</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-neutral-500">
                    {t('searchResults.showing', {
                      start: currentPage * pageSize + 1,
                      end: currentPage * pageSize + products.length,
                      total: total,
                    })}
                  </p>
                </div>

                {/* Client-side rendered products - this will replace the server-rendered ones */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
                  {products.map((product) => (
                    <div key={product.id} className="h-full">
                      <ProductTile product={product} locale={locale} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        {/* Simple Pagination */}
        {total > pageSize && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 0) changePage(currentPage - 1);
                    }}
                    aria-disabled={currentPage === 0}
                    className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {visiblePagination.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      className={currentPage === pageNumber ? 'bg-primary text-white' : ' '}
                      onClick={(e) => {
                        e.preventDefault();
                        changePage(pageNumber);
                      }}
                    >
                      {pageNumber + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {/**/}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < Math.ceil(total / pageSize) - 1) {
                        changePage(currentPage + 1);
                      }
                    }}
                    aria-disabled={currentPage === Math.ceil(total / pageSize) - 1}
                    className={currentPage === Math.ceil(total / pageSize) - 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}
