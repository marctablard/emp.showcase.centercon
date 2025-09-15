import { SearchParams, SearchResult } from '../model/common';
import { CreateQuoteInput, CreateQuoteReasonRequest, QuoteReason, QuoteReasonCreationResponse } from '../model/quote';
import { Quote } from '../model/quote/quote-list';

export interface QuoteService {
  /**
   * Create a new quote
   */
  createQuote(input: CreateQuoteInput): Promise<{ quoteId: string }>;

  /**
   * Get a list of quotes with optional filters
   */
  getQuotes(params?: SearchParams<Quote>): Promise<SearchResult<Quote>>;

  /**
   * Get a specific quote by ID
   */
  getQuote(quoteId: string): Promise<Quote>;

  /**
   * Updates the status of a quote
   * @param quoteId - The ID of the quote to update
   * @param status - The new status value
   * @param comment - Optional comment to include with the status update
   * @param locale - The user's locale (language code) to use for messages, defaults to 'en'
   * @param quoteReasonId - Optional quote reason ID to include with the status update
   */
  updateQuoteStatus(
    quoteId: string,
    status: string,
    comment?: string,
    locale?: string,
    quoteReasonId?: string,
  ): Promise<void>;

  /**
   * Get a specific quote reason by ID
   * @param quoteReasonId - The ID of the quote reason to retrieve
   * @returns Promise with the quote reason details
   */
  getQuoteReason(quoteReasonId: string): Promise<QuoteReason>;

  /**
   * Create a new quote reason
   * @param createQuoteReasonRequest - The data to create a new quote reason
   * @returns Promise with the ID of the created quote reason
   */
  createQuoteReason(createQuoteReasonRequest: CreateQuoteReasonRequest): Promise<QuoteReasonCreationResponse>;
}
