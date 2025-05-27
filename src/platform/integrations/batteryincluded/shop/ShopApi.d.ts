import { Product, BatteryIncludedSearchResponse, SearchParams, Preset, Highlight, Suggestion } from "../model";

export interface ShopApi {
  /**
   * Browse products with optional search query and filters
   * @param query Search query
   * @param page Page number
   * @param pageSize Number of items per page
   * @param locale Locale for localized content
   * @param filters Optional filters to apply
   * @param sort Optional sort parameter
   * @param preset Optional preset ID to use
   */
  browse(params: SearchParams<Product>): Promise<BatteryIncludedSearchResponse<Product>>;
  
  /**
   * Get product suggestions based on a search query
   * @param query Search query
   * @param locale Locale for localized content
   */
  suggest(query: string, locale?: string): Promise<Suggestion[]>;

  /**
   * Get highlighted products
   */
  getHighlights(): Promise<Highlight[]>;

  /**
   * Get product recommendations based on a product ID
   * @param id Product ID
   */
  getRecommendations(id: string): Promise<Product[]>;

  /**
   * Get available presets
   */
  getPresets(): Promise<Preset[]>;
}
