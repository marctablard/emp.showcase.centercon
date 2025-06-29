import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import type { EmporixConfig } from '../../config';
import {
  AddCartItemRequest,
  CreateCartRequest,
  CreatedCart,
  CreatedCartItem,
  EmporixCart,
  EmporixCartItem,
  UpdateCartItemRequest,
} from '../../model';
import type { CartApi } from '../CartApi';

@injectable('EmporixCartApi', 'Singleton')
class EmporixCartApi implements CartApi {
  private apiClient: EmporixApiClient;
  private config: EmporixConfig;

  constructor(
    @inject('EmporixApiInvoker') apiClient: EmporixApiClient,
    @inject('EmporixConfig') config: EmporixConfig,
  ) {
    this.apiClient = apiClient;
    this.config = config;
  }

  async createCart(createCartRequest: CreateCartRequest): Promise<string> {
    const response = await this.apiClient.authenticatedFetch(
      `/cart/${this.config.tenant}/carts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(createCartRequest),
      },
      // differentiate between customer and anonymous
      createCartRequest.customerId ? 'customer-saas' : 'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to create cart: ${response.statusText} ${errorDetails}`);
    }

    const createdCart: CreatedCart = await response.json();
    // TODO needs to be removed when Mixin Bug is done
    await this.updateCart(createdCart.cartId, {
      metadata: {
        mixins: {
          processupdate: 'https://res.cloudinary.com/saas-ag/raw/upload/schemata2/showcase/processupdate_v1.json',
        },
      },
    });
    return createdCart.cartId;
  }

  async getCart(cartId: string): Promise<EmporixCart | null> {
    const response = await this.apiClient.authenticatedFetch(
      `/cart/${this.config.tenant}/carts/${cartId}`,
      { method: 'GET' },
      'session',
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorDetails = await response.text();
      throw new Error(`Failed to get cart: ${response.statusText} ${errorDetails}`);
    }

    return await response.json();
  }

  async getCartByCriteria(
    siteCode: string,
    sessionId?: string,
    customerId?: string,
    type?: string,
  ): Promise<EmporixCart | undefined> {
    const queryParams = new URLSearchParams();
    queryParams.append('siteCode', siteCode);

    if (sessionId) {
      queryParams.append('sessionId', sessionId);
    }

    if (customerId) {
      queryParams.append('customerId', customerId);
    }

    if (type) {
      queryParams.append('type', type);
    }

    const response = await this.apiClient.authenticatedFetch(
      `/cart/${this.config.tenant}/carts?${queryParams.toString()}`,
      { method: 'GET' },
      'session',
    );

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      const errorDetails = await response.text();
      throw new Error(`Failed to get cart by criteria: ${response.statusText} ${errorDetails}`);
    }

    return await response.json();
  }

  async addItemToCart(cartId: string, item: AddCartItemRequest): Promise<string> {
    const response = await this.apiClient.authenticatedFetch(
      `/cart/${this.config.tenant}/carts/${cartId}/items?siteCode=${item.siteCode}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(item),
      },
      'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to add item to cart: ${response.statusText} ${errorDetails}`);
    }

    const createdItem: CreatedCartItem = await response.json();
    return createdItem.itemId;
  }

  async getCartItems(cartId: string): Promise<EmporixCartItem[]> {
    const response = await this.apiClient.authenticatedFetch(
      `/cart/${this.config.tenant}/carts/${cartId}/items`,
      { method: 'GET' },
      'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to get cart items: ${response.statusText} ${errorDetails}`);
    }

    return await response.json();
  }

  async updateCartItemQuantity(cartId: string, itemId: string, updateRequest: UpdateCartItemRequest): Promise<void> {
    const queryParams = new URLSearchParams();
    queryParams.append('partial', 'true');

    const url = `/cart/${this.config.tenant}/carts/${cartId}/items/${itemId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await this.apiClient.authenticatedFetch(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(updateRequest),
      },
      'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to update cart item: ${response.statusText} ${errorDetails}`);
    }
  }

  async removeCartItem(cartId: string, itemId: string): Promise<void> {
    const response = await this.apiClient.authenticatedFetch(
      `/cart/${this.config.tenant}/carts/${cartId}/items/${itemId}`,
      { method: 'DELETE' },
      'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to remove cart item: ${response.statusText} ${errorDetails}`);
    }
  }

  async deleteCart(cartId: string): Promise<void> {
    const response = await this.apiClient.authenticatedFetch(
      `/cart/${this.config.tenant}/carts/${cartId}`,
      { method: 'DELETE' },
      'session',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to delete cart: ${response.statusText} ${errorDetails}`);
    }
  }

  async updateCart(cartId: string, cart: Partial<EmporixCart>): Promise<void> {
    const response = await this.apiClient.authenticatedFetch(
      `/cart/${this.config.tenant}/carts/${cartId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(cart),
      },
      'service',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to update cart: ${response.statusText} ${errorDetails}`);
    }
  }
}

export default EmporixCartApi;
