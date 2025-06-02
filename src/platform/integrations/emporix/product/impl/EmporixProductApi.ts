import { PaginatedResponse, Product, SearchParams } from '../../model';
import { ProductApi } from '../ProductApi';
import { buildPaginatedResponse, buildSearchQuery } from '../../common/util/common';
import { inject } from 'inversify';
import type { EmporixConfig } from '../../config';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import { injectable } from '@/platform/core/di/injectable';

@injectable('EmporixProductApi', 'Singleton')
class EmporixProductApi implements ProductApi {
  constructor(
    @inject('EmporixApiInvoker') private apiClient: EmporixApiClient,
    @inject('EmporixConfig') private config: EmporixConfig,
  ) {
    this.apiClient = apiClient;
    this.config = config;
  }

  async getProducts(page?: number, pageSize?: number): Promise<PaginatedResponse<Product>> {
    const params: SearchParams<Product> = {
      page: page || 0,
      size: pageSize || 20,
    };
    const { body: _body, query } = buildSearchQuery(params);
    const response = await this.apiClient.authenticatedFetch(
      `/product/${this.config.tenant}/products?${query}`,
      { method: 'GET', headers: { 'X-Total-Count': 'true' } },
      'public',
    );

    return buildPaginatedResponse(params, response);
  }

  async searchProducts(params: SearchParams<Product>): Promise<PaginatedResponse<Product>> {
    const { body, query } = buildSearchQuery(params);
    const response = await this.apiClient.authenticatedFetch(
      `/product/${this.config.tenant}/products/search?${query}`,
      {
        method: 'POST',
        headers: {
          'X-Total-Count': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: body }),
      },
      'public',
    );
    return buildPaginatedResponse(params, response);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const response = await this.apiClient.authenticatedFetch(
      `/product/${this.config.tenant}/products/${id}`,
      { method: 'GET' },
      'public',
    );
    if (!response.ok) {
      if (response.status == 404) {
        return undefined;
      } else {
        throw new Error(`Failed to get product: ${response.statusText}`);
      }
    }
    return await response.json();
  }
}
export default EmporixProductApi;
