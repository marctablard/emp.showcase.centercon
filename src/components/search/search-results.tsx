'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchFilter } from '@/components/search/search-filter';
import { SearchLayoutToggle } from '@/components/search/search-layout-toggle';
import { SearchResultsGrid } from '@/components/search/search-results-grid';
import { SearchResultsList } from '@/components/search/search-results-list';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useSearch } from '@/hooks/search/useSearch';
import { SearchParams, SearchResult } from '@/platform/services/model/common';
import { Product } from '@/platform/services/model/product';

interface SearchClientWrapperProps {
  initialSearch?: SearchParams<Product>;
  initialResults?: SearchResult<Product>;
  locale: string;
}

export function SearchResultsComponent({ initialSearch, initialResults, locale }: SearchClientWrapperProps) {
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
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
    applyAllFacets,
    resetFacet,
    resetAllFacets,
    activeFilters,
    changePage,
  } = useSearch<Product>(initialSearch, initialResults);
  const visiblePagination = useMemo(() => {
    if (pageSize <= 0) {
      return [];
    }

    const totalPages = Math.ceil(total / pageSize);
    if (totalPages === 0) {
      return [];
    }

    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, total, pageSize]);

  useEffect(() => {
    // Parse URL parameters to restore search state
    const query = searchParams.get('q') ?? '';
    const page = parseInt(searchParams.get('page') ?? '0', 10);
    const size = parseInt(searchParams.get('size') ?? String(pageSize), 10);
    const sort = searchParams.get('sort') ?? undefined;

    const filters: Record<string, string | string[] | Record<string, string>> = {};

    searchParams.forEach((value, key) => {
      const filterRegex = /^filters\[(.*?)](\[]|\[(.*?)])?$/;
      const match = key.match(filterRegex);

      if (match) {
        const filterKey = match[1];
        const isArray = match[2] === '[]';
        const nestedKey = match[3];

        // Handle nested filters like filters[price][from]
        if (nestedKey) {
          if (!filters[filterKey] || typeof filters[filterKey] !== 'object' || Array.isArray(filters[filterKey])) {
            filters[filterKey] = {};
          }

          (filters[filterKey] as Record<string, string>)[nestedKey] = value;
        }
        // Handle array filters like filters[category][]
        else if (isArray) {
          if (!filters[filterKey]) {
            filters[filterKey] = [];
          } else if (!Array.isArray(filters[filterKey])) {
            filters[filterKey] = [filters[filterKey] as string];
          }

          (filters[filterKey] as string[]).push(value);
        }
        // Handle simple filters like filters[inStock]
        else {
          filters[filterKey] = value;
        }
      }
    });

    // Perform search with parameters from URL
    search({
      query: query,
      page: page,
      size: size, // Use the size from URL parameters
      sort: sort,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });
  }, [searchParams, pageSize, search]);

  return (
    <>
      <div className="flex w-full items-start justify-between gap-4">
        {/* Todo: Break filter pills in new lines when there are too many filters */}
        <SearchFilter
          {...{
            activeFilters,
            availableFilters,
            resetFacet,
            resetAllFacets,
            applyFacet,
            applyRangeFacet,
            applyAllFacets,
          }}
        />
        <SearchLayoutToggle active={layout} onSelectLayout={(selectedLayout) => setLayout(selectedLayout)} />
      </div>

      {/* Product List/Grid */}
      <div className="mt-6 w-full">
        {layout === 'list' && (
          <SearchResultsList
            products={products}
            locale={locale}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            loading={loading}
          />
        )}

        {layout === 'grid' && (
          <SearchResultsGrid
            products={products}
            locale={locale}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            loading={loading}
          />
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
                    className={currentPage === 0 ? 'text-text-disabled pointer-events-none' : ''}
                  />
                </PaginationItem>

                {visiblePagination.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      className={currentPage === pageNumber ? 'bg-surface-action text-text-on-action' : ' '}
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
                    className={
                      currentPage === Math.ceil(total / pageSize) - 1 ? 'text-text-disabled pointer-events-none' : ''
                    }
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
