import { inject } from 'inversify';
import { EmporixPaginatedResponse, EmporixProduct } from '@/platform/integrations/emporix/model';
import type { EmporixProductApi } from '@/platform/integrations/emporix/product/EmporixProductApi';
import type { SearchParams, SearchResult } from '@/platform/services/model/common';
import type { Product } from '@/platform/services/model/product';
import type { SearchService } from '@/platform/services/search/SearchService';
import type { ProductMapper } from '../../model/product/ProductMapper';
import type { SearchSuggestions } from '../../model/search';

/**
 * Implementation of SearchService for BatteryIncluded product data.
 * Maps between BatteryIncluded API product format and internal Product model.
 */

class EmporixSearchService implements SearchService {
  private productApi: EmporixProductApi;
  private productMapper: ProductMapper<EmporixProduct>;

  constructor(
    @inject('EmporixProductApi') productApi: EmporixProductApi,
    @inject('EmporixProductMapper') productMapper: ProductMapper<EmporixProduct>,
  ) {
    this.productApi = productApi;
    this.productMapper = productMapper;
  }

  async searchProducts(params: SearchParams<Product>): Promise<SearchResult<Product>> {
    const searchResult: EmporixPaginatedResponse<EmporixProduct> = await this.productApi.searchProducts({
      page: (params.page || 0) + 1, // normalize page
      size: params.size,
      query: params.query,
      sort: params.sort,
      filters: params.filters,
    });
    return {
      items: searchResult.items.map((hit) => this.productMapper.mapToService(hit)),
      page: searchResult.page - 1,
      pageSize: params.size || 10, // default
      total: searchResult.total,
      availableFilters: [],
    };
  }

  async getSuggestions(query: string, _locale?: string): Promise<SearchSuggestions> {
    const searchResult: EmporixPaginatedResponse<EmporixProduct> = await this.productApi.searchProducts({
      page: 1,
      size: 10,
      query: query,
      sort: undefined,
      filters: undefined,
    });
    return {
      queryCompletions: [],
      products: searchResult.items.map((hit) => this.productMapper.mapToService(hit)),
      categories: [],
    };
  }

  async getHighlights(): Promise<Product[]> {
    return [];
  }

  async getRecommendations(_productId: string): Promise<Product[]> {
    return [];
  }
}

export default EmporixSearchService;
