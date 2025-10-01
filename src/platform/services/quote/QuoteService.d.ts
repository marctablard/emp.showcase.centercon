import { SearchParams, SearchResult } from '../model/common';
import {
  CreateQuoteInput,
  CreateQuoteReasonRequest,
  QuoteHistory,
  QuoteReason,
  QuoteReasonCreationResponse,
  QuoteScope,
} from '../model/quote';
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
   * Updates a quote
   * @param quoteId - The ID of the quote to update
   * @param body - The quote data to update
   * @param scope - The scope to update the quote in, defaults to 'public'
   * @returns Promise that resolves when the update is complete
   */
  updateQuote(quoteId: string, op: string, path: string, value: any, scope: QuoteScope): Promise<void>;

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

  /**
   * Get quote history for a specific quote
   * @param quoteId - The ID of the quote to get history for
   * @returns Promise with the quote history
   */
  getQuoteHistory(quoteId: string): Promise<QuoteHistory>;
}
