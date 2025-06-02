import { cache } from 'react';
import { SearchParams, SearchResult } from '@/platform/services/model/common';
import { Product } from '@/platform/services/model/product';
import { SearchService } from '@/platform/services/search';

const getSearchService = () => globalThis.EMP.platform.ssr.get<SearchService>('SearchService');

const _searchProducts = cache(async (params: SearchParams<Product>): Promise<SearchResult<Product>> => {
  const searchResult = await getSearchService().searchProducts(params);
  return searchResult || null;
});

export function searchProducts(params: SearchParams<Product>): Promise<SearchResult<Product>> {
  return _searchProducts(params);
}
