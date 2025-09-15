import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { EmporixPaginatedResponse } from '@/platform/integrations/emporix/model';
import type { EmporixQuote } from '@/platform/integrations/emporix/model/quote';
import type { EmporixQuoteApi } from '@/platform/integrations/emporix/quote/EmporixQuoteApi';
import type {
  CreateQuoteInput,
  CreateQuoteReasonRequest,
  Quote,
  QuoteReason,
  QuoteReasonCreationResponse,
} from '@/platform/services/model/quote';
import type { QuoteMapper } from '@/platform/services/model/quote/mapper/QuoteMapper';
import type { QuoteService } from '@/platform/services/quote/QuoteService';
import { SearchParams, SearchResult } from '../../model/common';

@injectable('QuoteService', 'Singleton')
class EmporixQuoteService implements QuoteService {
  constructor(
    @inject('EmporixQuoteApi') private quoteApi: EmporixQuoteApi,
    @inject('QuoteMapper') private quoteMapper: QuoteMapper<EmporixQuote>,
  ) {}

  async createQuote(input: CreateQuoteInput): Promise<{ quoteId: string }> {
    const res = await this.quoteApi.createQuote(input as any);
    return { quoteId: res.quoteId };
  }

  async getQuotes(params: SearchParams<Quote>): Promise<SearchResult<Quote>> {
    const searchResult: EmporixPaginatedResponse<EmporixQuote> = await this.quoteApi.getQuotes({
      page: (params.page || 0) + 1,
      size: params.size,
      query: params.query,
      sort: params.sort,
    });

    // Wait for all quotes to be mapped - using Promise.all to process them in parallel
    const mappedQuotes = await Promise.all(
      searchResult.items.map((quote) => Promise.resolve(this.quoteMapper.mapToService(quote))),
    );

    return {
      items: mappedQuotes,
      page: searchResult.page - 1,
      pageSize: params.size || 10,
      total: searchResult.total,
      availableFilters: [],
    };
  }

  async getQuote(quoteId: string): Promise<Quote> {
    const quote = await this.quoteApi.getQuote(quoteId);
    return Promise.resolve(this.quoteMapper.mapToService(quote));
  }

  async updateQuoteStatus(quoteId: string, status: string, comment?: string, locale: string = 'en'): Promise<void> {
    let quoteReasonId = undefined;
    if (status === 'DECLINED') {
      const quoteId_current = `${quoteId}_${Date.now()}`;
      const code = `${(comment || quoteId_current).toUpperCase().replace(/\s+/g, '_')}`;

      const message: Record<string, string> = {};
      message[locale] = comment || 'Price too high';

      const response = await this.createQuoteReason({
        code: code,
        type: 'DECLINE',
        message: message,
      });
      quoteReasonId = response.id;
    }
    return this.quoteApi.updateQuoteStatus(quoteId, status, comment, quoteReasonId);
  }

  async getQuoteReason(quoteReasonId: string): Promise<QuoteReason> {
    const emporixQuoteReason = await this.quoteApi.getQuoteReason(quoteReasonId);
    return emporixQuoteReason as QuoteReason;
  }

  async createQuoteReason(createQuoteReasonRequest: CreateQuoteReasonRequest): Promise<QuoteReasonCreationResponse> {
    const response = await this.quoteApi.createQuoteReason(createQuoteReasonRequest);
    return { id: response.id };
  }
}

export default EmporixQuoteService;
