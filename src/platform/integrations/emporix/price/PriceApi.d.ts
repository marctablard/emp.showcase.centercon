import type { EmporixConfig } from '../config';
import type { MatchPricesByContextRequest, MatchPricesRequest, MatchedPrice } from '../model/price';

/**
 * Interface for Emporix Price API
 */
export interface PriceApi {
  /**
   * Configuration for the Emporix API
   */
  readonly config: EmporixConfig;

  /**
   * Match prices for specific attributes
   * @param request The price matching request
   * @returns The matched price response
   */
  matchPrices(request: MatchPricesRequest): Promise<MatchedPrice[]>;

  /**
   * Match prices based on session context
   * @param request The price matching by context request
   * @returns The matched price response
   */
  matchPricesByContext(request: MatchPricesByContextRequest): Promise<MatchedPrice[]>;
}
