'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { SearchActiveFiltersWithReset } from '@/components/search/search-active-filters-with-reset';
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
  const t = useTranslations('search.searchResults');
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

  // Shared props for SearchFilter component (used in both mobile and desktop layouts)
  const searchFilterProps = {
    activeFilters,
    availableFilters,
    resetFacet,
    resetAllFacets,
    applyFacet,
    applyRangeFacet,
    applyAllFacets,
  };

  // Shared props for ActiveFiltersWithReset component
  const activeFiltersProps = {
    activeFilters,
    resetFacet,
    resetAllFacets,
    resetLabel: t('resetFilter'),
  };
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
    // Whitelist of search-related parameters
    const searchRelatedParams = ['q', 'page', 'size', 'sort', 'filters'];
    const isSearchRelatedParam = (key: string) =>
      searchRelatedParams.some((param) => key === param || key.startsWith(`${param}[`));

    // Check if URL has any search-related params - if not, skip processing
    // This prevents reacting to unrelated params like email, callbackUrl from auth dialogs
    const hasSearchParams = Array.from(searchParams.keys()).some(isSearchRelatedParam);
    if (!hasSearchParams && searchParams.toString() !== '') {
      return;
    }

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
      {/* Top controls */}
      <div className="w-full">
        {/* Row: SearchFilter + Layout toggle inline on mobile; desktop keeps toggle on the right */}
        <div className="flex w-full justify-between gap-4">
          {/* Mobile: SearchFilter only */}
          <div className="flex sm:hidden">
            <SearchFilter {...searchFilterProps} />
          </div>

          {/* Desktop: SearchFilter + Active filters inline */}
          <div className="hidden flex-wrap items-center gap-4 sm:flex">
            <SearchFilter {...searchFilterProps} />
            <SearchActiveFiltersWithReset {...activeFiltersProps} />
          </div>

          <SearchLayoutToggle active={layout} onSelectLayout={(selectedLayout) => setLayout(selectedLayout)} />
        </div>

        {/* Mobile: Active filters below, full width */}
        <div className="mt-4 flex flex-col flex-wrap gap-4 sm:hidden">
          <SearchActiveFiltersWithReset {...activeFiltersProps} />
        </div>
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
                    disabled={currentPage === 0}
                  />
                </PaginationItem>

                {visiblePagination.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
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
                    disabled={currentPage === Math.ceil(total / pageSize) - 1}
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
