'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
    suggestions,
    getSuggestions,
    changePage,
    currentQuery,
  } = useSearch<Product>(initialSearch, initialResults);
  const [queryInput, setQueryInput] = useState(currentQuery || '');
  const [visiblePagination, setVisibilePagination] = useState<number[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
    const value = e.target.value;
    setQueryInput(value);

    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }

    inputTimeoutRef.current = setTimeout(() => {
      // Fetch suggestions only when at least 2 characters are entered
      if (value.trim().length >= 2) {
        getSuggestions(value, locale);
        setShowSuggestions(true);
      } else {
        getSuggestions('', locale);
        setShowSuggestions(false);
      }
    }, 500);
  };

  useEffect(() => {
    const totalPages = Math.ceil(total / pageSize);
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    setVisibilePagination(Array.from({ length: end - start + 1 }, (_, i) => start + i));
  }, [currentPage, total, pageSize]);

  useEffect(() => {
    // Show suggestions dropdown if any suggestion type has results
    if (
      suggestions.queryCompletions.length > 0 ||
      suggestions.products.length > 0 ||
      suggestions.categories.length > 0
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2 relative">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search products..."
            value={queryInput}
            onChange={handleInput}
            className="w-full"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions &&
            queryInput.trim().length >= 2 &&
            (suggestions.queryCompletions.length > 0 ||
              suggestions.products.length > 0 ||
              suggestions.categories.length > 0) && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto divide-y divide-gray-100"
              >
                {/* Categories Section */}
                {suggestions.categories.length > 0 && (
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                      Categories
                    </h3>
                    <ul>
                      {suggestions.categories.map((category, index: number) => (
                        <li
                          key={`category-${index}`}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center text-sm transition-colors duration-150 rounded-md"
                          onClick={() => {
                            setQueryInput(category.name);
                            handleSearch(new Event('submit') as any);
                          }}
                        >
                          <span className="mr-2">🏷️</span> {category.name}{' '}
                          <span className="ml-auto text-xs text-gray-400">({category.count})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Products Section */}
                {suggestions.products.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Products</h3>
                    <ul>
                      {suggestions.products.slice(0, 4).map((product: Product) => (
                        <li
                          key={`product-${product.id}`}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center text-sm transition-colors duration-150 rounded-md"
                          onClick={() => {
                            // Handle both string and LocalizedString for product name
                            const productName =
                              typeof product.name === 'string'
                                ? product.name
                                : product.name[locale] || Object.values(product.name)[0];
                            setQueryInput(productName);
                            handleSearch(new Event('submit') as any);
                          }}
                        >
                          <span className="mr-2">📦</span>
                          <span
                            dangerouslySetInnerHTML={{
                              __html:
                                typeof product.name === 'string'
                                  ? product.name
                                  : product.name[locale] || Object.values(product.name)[0],
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Query Completions Section */}
                {suggestions.queryCompletions.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                      Suggestions
                    </h3>
                    <ul>
                      {suggestions.queryCompletions.map((suggestion: string, index: number) => (
                        <li
                          key={`suggestion-${index}`}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center text-sm transition-colors duration-150 rounded-md"
                          onClick={() => {
                            setQueryInput(suggestion);
                            handleSearch(new Event('submit') as any);
                          }}
                        >
                          <span className="mr-2">🔍</span> {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
        </div>
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
