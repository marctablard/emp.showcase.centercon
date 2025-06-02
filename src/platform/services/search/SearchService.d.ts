// c:\Workspace\emporix-showcase\src\platform\services\search\SearchService.d.ts
import { SearchParams, SearchResult } from '../model/common';
import { Product } from '../model/product';

export interface SearchService {
  /**
   * Search for products based on the provided parameters
   */
  searchProducts(params: SearchParams<Product>): Promise<SearchResult<Product>>;

  /**
   * Get product suggestions based on a search query
   */
  getSuggestions(query: string, locale?: string): Promise<string[]>;

  /**
   * Get highlighted products
   */
  getHighlights(): Promise<Product[]>;

  /**
   * Get product recommendations based on a product ID
   */
  getRecommendations(productId: string): Promise<Product[]>;
}
