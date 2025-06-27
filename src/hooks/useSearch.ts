import { useCallback, useEffect, useRef, useState } from 'react';
import useHistory from '@/hooks/history/useHistory';
import { SearchParams as BaseSearchParams, Filter, SearchResult } from '@/platform/services/model/common';
import { SearchSuggestions } from '@/platform/services/model/search/SearchSuggestions';

// Extend the SearchParams type to support nested objects in filters
export type FilterValue = string | string[] | Record<string, string>;

type SearchParams<T> = Omit<BaseSearchParams<T>, 'filters'> & {
  filters?: Record<string, FilterValue>;
};

export function useSearch<T>(initialSearch?: SearchParams<T>, initialResult?: SearchResult<T>) {
  const { addSearchQuery } = useHistory();
  const [data, setData] = useState<T[]>(initialResult?.items || []);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [facets, setFacets] = useState<Filter[]>([]);
  const [total, setTotal] = useState(initialResult?.total || 0);
  const [currentPage, setCurrentPage] = useState(initialResult?.page || 0);
  const [pageSize, setPageSize] = useState(initialResult?.pageSize || 20);
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>(initialSearch?.filters || {});
  const [currentQuery, setCurrentQuery] = useState<string | undefined>(initialSearch?.query);
  const [currentSort, setCurrentSort] = useState<string | undefined>(initialSearch?.sort);
  // Suggestions state
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    queryCompletions: [],
    products: [],
    categories: [],
  });

  // Keep track of the last search params for pagination
  const lastSearchParams = useRef<SearchParams<T>>({
    page: 0,
    size: 12,
  });

  /**
   * Search for products with the given parameters
   */
  const search = useCallback(async (params: SearchParams<T>) => {
    try {
      setLoading(true);
      setError(null);

      // Build the URL with query parameters
      const url = new URL('/api/search', window.location.origin);

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
          } else if (typeof value === 'object' && value !== null) {
            // Handle nested objects like range filters
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              url.searchParams.append(`filters[${key}][${nestedKey}]`, String(nestedValue));
            });
          } else {
            url.searchParams.append(`filters[${key}]`, String(value));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
   * Apply a range facet filter to the search
   */
  const applyRangeFacet = useCallback(
    (facetId: string, min: string, max: string) => {
      const newFilters = {
        ...activeFilters,
        [facetId]: {
          from: min,
          till: max,
        },
      };

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
   * Apply multiple facet filters at once to the search
   */
  const applyAllFacets = useCallback(
    (facets: Array<{ facetId: string; value: string | string[] } | { facetId: string; min: string; max: string }>) => {
      // Start with current active filters
      const newFilters = { ...activeFilters };

      // Apply each facet to build up the filters object
      facets.forEach((facet) => {
        if ('value' in facet) {
          // Handle standard facet
          newFilters[facet.facetId] = facet.value;
        } else if ('min' in facet && 'max' in facet) {
          // Handle range facet
          newFilters[facet.facetId] = {
            from: facet.min,
            till: facet.max,
          };
        }
      });

      // Reset to first page when applying filters
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
  const getSuggestions = useCallback(async (query: string, locale?: string): Promise<void> => {
    setLoading(true);
    if (!query?.trim()) {
      setSuggestions({
        queryCompletions: [],
        products: [],
        categories: [],
      });
      return;
    }
    try {
      const url = new URL('/api/search/suggestions', window.location.origin);
      url.searchParams.append('query', query);
      if (locale) {
        url.searchParams.append('locale', locale);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Suggestions failed: ${response.statusText}`);
      }
      const data = await response.json();

      // Set suggestions directly from API response
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    if (currentQuery) {
      addSearchQuery(currentQuery);
    }
  }, [currentQuery, addSearchQuery]);

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
    applyAllFacets,
    applyFacet,
    applyRangeFacet,
    resetFacet,
    resetAllFacets,
    changePage,
    changeSort,
    suggestions,
    getSuggestions,
    setPage: changePage,
  };
}

export default useSearch;
