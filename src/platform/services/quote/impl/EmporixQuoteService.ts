import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { EmporixPaginatedResponse } from '@/platform/integrations/emporix/model';
import type { EmporixQuote, EmporixQuoteHistory } from '@/platform/integrations/emporix/model/quote';
import type { EmporixQuoteApi } from '@/platform/integrations/emporix/quote/EmporixQuoteApi';
import type { CustomerService } from '@/platform/services/customer/CustomerService';
import type {
  CreateQuoteInput,
  CreateQuoteReasonRequest,
  Quote,
  QuoteHistory,
  QuoteReason,
  QuoteReasonCreationResponse,
  QuoteScope,
  QuoteShipping,
} from '@/platform/services/model/quote';
import type { QuoteHistoryMapper } from '@/platform/services/model/quote/mapper/QuoteHistoryMapper';
import type { QuoteMapper } from '@/platform/services/model/quote/mapper/QuoteMapper';
import type { QuoteService } from '@/platform/services/quote/QuoteService';
import { SearchParams, SearchResult } from '../../model/common';

@injectable('QuoteService', 'Singleton')
class EmporixQuoteService implements QuoteService {
  constructor(
    @inject('EmporixQuoteApi') private quoteApi: EmporixQuoteApi,
    @inject('CustomerService') private customerService: CustomerService,
    @inject('QuoteMapper') private quoteMapper: QuoteMapper<EmporixQuote>,
    @inject('QuoteHistoryMapper') private quoteHistoryMapper: QuoteHistoryMapper<EmporixQuoteHistory>,
  ) {}

  async createQuote(input: CreateQuoteInput): Promise<{ quoteId: string }> {
    const res = await this.quoteApi.createQuote(input as any);
    return { quoteId: res.quoteId };
  }

  async getQuotes(params: SearchParams<Quote>): Promise<SearchResult<Quote>> {
    const customer = await this.customerService.getCustomer();
    if (!customer) {
      throw new Error('Customer not found');
    }
    const searchResult: EmporixPaginatedResponse<EmporixQuote> = await this.quoteApi.getQuotes({
      page: (params.page || 0) + 1,
      size: params.size,
      query: params.query,
      criteria: {
        'customer.customerId': customer.id,
      },
      sort: params.sort,
    });

    // TODO fetch for quotes of subordinates

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

  async updateQuote(
    quoteId: string,
    op: string,
    path: string,
    value: any,
    scope: QuoteScope = 'public',
  ): Promise<void> {
    await this.quoteApi.patchQuote(quoteId, { op, path, value }, scope);
  }

  async getQuoteReason(quoteReasonId: string): Promise<QuoteReason> {
    const emporixQuoteReason = await this.quoteApi.getQuoteReason(quoteReasonId);
    return emporixQuoteReason as QuoteReason;
  }

  async createQuoteReason(createQuoteReasonRequest: CreateQuoteReasonRequest): Promise<QuoteReasonCreationResponse> {
    const response = await this.quoteApi.createQuoteReason(createQuoteReasonRequest);
    return { id: response.id };
  }

  async getQuoteHistory(quoteId: string): Promise<QuoteHistory> {
    const emporixHistory = await this.quoteApi.getQuoteHistory(quoteId);
    const mappedHistory = this.quoteHistoryMapper.mapToService(emporixHistory);
    return Promise.resolve(mappedHistory);
  }
}

export default EmporixQuoteService;
