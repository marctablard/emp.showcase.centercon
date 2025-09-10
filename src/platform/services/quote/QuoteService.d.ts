import { CreateQuoteInput } from '../model/quote';
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
}
