import type { Price } from '../model/price/price';

/**
 * Interface for price service.
 * Defines methods for price operations.
 */
export interface PriceService {
  /**
   * Match prices for products based on the given criteria
   * @param productId The product ID to match prices for
   * @param params Optional parameters for price matching
   * @returns Array of matched prices
   */
  async getProductPrice(productId: string, unitCode: string, quantity: number, params?: { currency?: string; country?: string; siteCode?: string }): Promise<Price | null>;
}
