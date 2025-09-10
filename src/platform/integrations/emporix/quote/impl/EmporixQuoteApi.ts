import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import { buildPaginatedResponse, buildSearchQuery } from '../../common/util/common';
import type { EmporixConfig } from '../../config';
import { EmporixPaginatedResponse, EmporixSearchParams } from '../../model';
import { EmporixCreateQuoteRequest, EmporixQuote, EmporixQuoteCreationResponse } from '../../model/quote';
import type { EmporixQuoteApi as IEmporixQuoteApi } from '../EmporixQuoteApi';

@injectable('EmporixQuoteApi', 'Singleton')
class EmporixQuoteApi implements IEmporixQuoteApi {
  constructor(
    @inject('EmporixApiInvoker') private apiClient: EmporixApiClient,
    @inject('EmporixConfig') private config: EmporixConfig,
  ) {}

  async createQuote(createQuoteRequest: EmporixCreateQuoteRequest): Promise<EmporixQuoteCreationResponse> {
    const response = await this.apiClient.authenticatedFetch(
      `/quote/${this.config.tenant}/quotes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(createQuoteRequest),
      },
      'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to create quote: ${response.statusText} ${errorDetails}`);
    }

    const json = await response.json();
    return { quoteId: json.quoteId };
  }

  async getQuotes(params: EmporixSearchParams<EmporixQuote>): Promise<EmporixPaginatedResponse<EmporixQuote>> {
    const { body: _body, query } = buildSearchQuery(params);
    const response = await this.apiClient.authenticatedFetch(
      `/quote/${this.config.tenant}/quotes?${query}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
      'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to fetch quotes: ${response.statusText} ${errorDetails}`);
    }

    const paginatedResponse = await buildPaginatedResponse(params, response);
    console.log('Paginated Response : ', paginatedResponse);
    return paginatedResponse;
  }

  async getQuote(quoteId: string): Promise<EmporixQuote> {
    const response = await this.apiClient.authenticatedFetch(
      `/quote/${this.config.tenant}/quotes/${quoteId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
      'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to fetch quote ${quoteId}: ${response.statusText} ${errorDetails}`);
    }

    return await response.json();
  }
}

export default EmporixQuoteApi;
