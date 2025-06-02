'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProductTile, ProductTileSkeleton } from '@/components/product/product-tile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  // Initialize the search hook with Product type and initial results
  const {
    data: products,
    loading,
    total,
    currentPage,
    pageSize,
    search,
    changePage,
    currentQuery,
  } = useSearch<Product>(initialSearch, initialResults);
  const [queryInput, setQueryInput] = useState(currentQuery);
  const [visiblePagination, setVisibilePagination] = useState<number[]>([]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search({
      query: queryInput,
      page: currentPage,
      size: pageSize,
    });
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryInput(e.target.value);
    /*
    TODO would be a nice Live-Search Feature, but needs debugging
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    setInputTimeout(setTimeout(() => {
      search({
        query: queryInput,
        page: currentPage,
        size: pageSize
      });
    }, 500));
    */
  };

  useEffect(() => {
    const totalPages = Math.ceil(total / pageSize);
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    setVisibilePagination(Array.from({ length: end - start + 1 }, (_, i) => start + i));
  }, [currentPage, total, pageSize]);

  return (
    <>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <Input
          type="text"
          placeholder="Search products..."
          value={queryInput}
          onChange={handleInput}
          className="max-w-md"
        />
        <Button type="submit">Search</Button>
      </form>

      {/* Product Grid */}
      <div className="w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: Math.min(pageSize, products.length) }).map((_, i) => (
              <ProductTileSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium mb-2">{t('searchResults.noProductsFound')}</h2>
                <p className="text-gray-500">{t('searchResults.tryAdjusting')}</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    {t('searchResults.showing', {
                      start: currentPage * pageSize + 1,
                      end: currentPage * pageSize + products.length,
                      total: total,
                    })}
                  </p>
                </div>

                {/* Client-side rendered products - this will replace the server-rendered ones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      isActive={true}
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
