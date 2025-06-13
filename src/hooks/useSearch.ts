import { useCallback, useRef, useState } from 'react';
import { Filter, SearchParams, SearchResult } from '@/platform/services/model/common';

export function useSearch<T>(initialSearch?: SearchParams<T>, initialResult?: SearchResult<T>) {
  const [data, setData] = useState<T[]>(initialResult?.items || []);
  const [loading, setLoading] = useState(false);
  const [facets, setFacets] = useState<Filter[]>([]);
  const [total, setTotal] = useState(initialResult?.total || 0);
  const [currentPage, setCurrentPage] = useState(initialResult?.page || 0);
  const [pageSize, setPageSize] = useState(initialResult?.pageSize || 20);
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>(initialSearch?.filters || {});
  const [currentQuery, setCurrentQuery] = useState<string | undefined>(initialSearch?.query);
  const [currentSort, setCurrentSort] = useState<string | undefined>(initialSearch?.sort);

  // Keep track of the last search params for pagination
  const lastSearchParams = useRef<SearchParams<T>>({
    page: 0,
    size: 12,
  });

  /**
   * Search for products with the given parameters
   */
  const search = useCallback(async (params: SearchParams<T>) => {
    setLoading(true);

    try {
      // Build the URL with query parameters
      const url = new URL('/api/search');

      // Add basic parameters
      if (params.query) {
        url.searchParams.append('query', params.query);
        setCurrentQuery(params.query);
      }

      if (params.page !== undefined) {
        url.searchParams.append('page', params.page.toString());
        setCurrentPage(params.page);
      }

      if (params.size !== undefined) {
        url.searchParams.append('size', params.size.toString());
        setPageSize(params.size);
      }

      if (params.sort) {
        url.searchParams.append('sort', params.sort);
        setCurrentSort(params.sort);
      }

      // Add filters if present
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((val) => {
              url.searchParams.append(`filters[${key}][]`, val);
            });
          } else {
            url.searchParams.append(`filters[${key}]`, value);
          }
        });
        setActiveFilters(params.filters);
      }

      // Save the search params for pagination
      lastSearchParams.current = params;

      // Fetch the search results
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResult<T> = await response.json();

      // Update state with the search results
      setData(data.items);
      setTotal(data.total);
      setCurrentPage(data.page);
      setPageSize(data.pageSize);

      if (data.availableFilters) {
        setFacets(data.availableFilters);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Apply a facet filter to the search
   */
  const applyFacet = useCallback(
    (facetId: string, value: string | string[]) => {
      const newFilters = { ...activeFilters, [facetId]: value };

      // Reset to first page when applying a filter
      search({
        ...lastSearchParams.current,
        page: 0,
        filters: newFilters,
      });
    },
    [activeFilters, search],
  );

  /**
   * Remove a facet filter from the search
   */
  const resetFacet = useCallback(
    (facetId: string) => {
      const newFilters = { ...activeFilters };
      delete newFilters[facetId];

      // Reset to first page when removing a filter
      search({
        ...lastSearchParams.current,
        page: 0,
        filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
      });
    },
    [activeFilters, search],
  );

  /**
   * Reset all facet filters
   */
  const resetAllFacets = useCallback(() => {
    // Reset to first page with no filters
    search({
      ...lastSearchParams.current,
      page: 0,
      filters: undefined,
    });

    setActiveFilters({});
  }, [search]);

  /**
   * Change the current page
   */
  const changePage = useCallback(
    (page: number) => {
      search({
        ...lastSearchParams.current,
        page,
      });
    },
    [search],
  );

  /**
   * Change the sort order
   */
  const changeSort = useCallback(
    (sort: string) => {
      search({
        ...lastSearchParams.current,
        sort,
        page: 0, // Reset to first page when changing sort
      });
    },
    [search],
  );

  return {
    // State
    data,
    loading,
    facets,
    total,
    currentPage,
    pageSize,
    activeFilters,
    currentQuery,
    currentSort,

    // Functions
    search,
    applyFacet,
    resetFacet,
    resetAllFacets,
    changePage,
    changeSort,
  };
}

export default useSearch;
