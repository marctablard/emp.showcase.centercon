import type { EmporixPaginatedResponse, EmporixSearchParams } from '../model/common';
import type {
  EmporixCreateQuoteReasonRequest,
  EmporixCreateQuoteRequest,
  EmporixQuoteCreationResponse,
  EmporixQuoteReason,
  EmporixQuoteReasonCreationResponse,
} from '../model/quote';
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

  /**
   * Update quote status
   * @param quoteId Quote ID to update
   * @param status New status to set (e.g., 'ACCEPTED', 'DECLINED')
   * @param comment Optional comment to include with the status update
   * @param quoteReasonId Optional quote reason ID to include with the status update
   * @returns Promise that resolves when the update is complete
   */
  updateQuoteStatus(quoteId: string, status: string, comment?: string, quoteReasonId?: string): Promise<void>;

  /**
   * Get a specific quote reason by ID
   * @param quoteReasonId The ID of the quote reason to retrieve
   * @returns Promise with the retrieved quote reason
   */
  getQuoteReason(quoteReasonId: string): Promise<EmporixQuoteReason>;

  /**
   * Create a new quote reason
   * @param createQuoteReasonRequest The request payload to create a quote reason
   * @returns Promise with the ID of the created quote reason
   */
  createQuoteReason(
    createQuoteReasonRequest: EmporixCreateQuoteReasonRequest,
  ): Promise<EmporixQuoteReasonCreationResponse>;
}
