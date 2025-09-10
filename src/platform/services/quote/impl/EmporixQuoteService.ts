import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { EmporixPaginatedResponse } from '@/platform/integrations/emporix/model';
import type { EmporixQuote } from '@/platform/integrations/emporix/model/quote';
import type { EmporixQuoteApi } from '@/platform/integrations/emporix/quote/EmporixQuoteApi';
import type { CreateQuoteInput, Quote } from '@/platform/services/model/quote';
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

    return {
      items: searchResult.items.map((quote) => this.quoteMapper.mapToService(quote)),
      page: searchResult.page - 1,
      pageSize: params.size || 10,
      total: searchResult.total,
      availableFilters: [],
    };
  }

  async getQuote(quoteId: string): Promise<Quote> {
    const quote = await this.quoteApi.getQuote(quoteId);
    return this.quoteMapper.mapToService(quote);
  }
}

export default EmporixQuoteService;
