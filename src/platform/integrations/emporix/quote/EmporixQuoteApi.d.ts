import type { EmporixCreateQuoteRequest, EmporixQuoteCreationResponse } from '../model/quote';
import type { EmporixQuote } from '../model/quote-list';

/**
 * Interface for Quote API operations
 */
export interface EmporixQuoteApi {
  /**
   * Create a new quote from current cart and checkout data
   */
  createQuote(createQuoteRequest: EmporixCreateQuoteRequest): Promise<EmporixQuoteCreationResponse>;

  /**
   * Get a list of quotes with optional filters
   */
  getQuotes(params: EmporixSearchParams<EmporixQuote>): Promise<EmporixPaginatedResponse<EmporixQuote>>;

  /**
   * Get a specific quote by ID
   */
  getQuote(quoteId: string): Promise<EmporixQuote>;
}
