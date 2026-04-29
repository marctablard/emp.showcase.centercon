import { inject } from 'inversify';
import 'server-only';
import { injectable } from '@/platform/core/di/injectable';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import type { EmporixConfig } from '../../config';
import type {
  EmporixShoppingList,
  EmporixShoppingListItem,
  EmporixShoppingListApi as IEmporixShoppingListApi,
} from '../EmporixShoppingListApi';

const PROJECT_MIXIN_KEY = 'project';
const PROJECT_MIXIN_SCHEMA = 'https://res.cloudinary.com/saas-ag/raw/upload/schemata2/showcasedemo/project_v1.json';

@injectable('EmporixShoppingListApi', 'Singleton')
class EmporixShoppingListApi implements IEmporixShoppingListApi {
  constructor(
    @inject('EmporixApiInvoker') private apiClient: EmporixApiClient,
    @inject('EmporixConfig') private config: EmporixConfig,
  ) {}

  private baseUrl(): string {
    return `shoppinglist/${this.config.tenant}/shopping-lists`;
  }

  async getLists(pageSize = 20, pageNumber = 1): Promise<{ items: EmporixShoppingList[]; total: number }> {
    const response = await this.apiClient.authenticatedFetch(
      `${this.baseUrl()}?pageSize=${pageSize}&pageNumber=${pageNumber}`,
      { method: 'GET' },
      'customer-saas',
    );

    if (!response.ok) {
      if (response.status === 404) return { items: [], total: 0 };
      const errorDetails = await response.text();
      throw new Error(`Failed to get shopping lists: ${response.statusText} ${errorDetails}`);
    }

    const data = await response.json();
    const items: EmporixShoppingList[] = Array.isArray(data) ? data : (data.items ?? []);
    const total = data.totalCount ?? data.total ?? items.length;
    return { items, total };
  }

  async getList(listId: string): Promise<EmporixShoppingList | null> {
    const response = await this.apiClient.authenticatedFetch(
      `${this.baseUrl()}/${listId}`,
      { method: 'GET' },
      'customer-saas',
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      const errorDetails = await response.text();
      throw new Error(`Failed to get shopping list: ${response.statusText} ${errorDetails}`);
    }

    return response.json();
  }

  async createList(name: string, projectId?: string): Promise<EmporixShoppingList> {
    const body: Record<string, any> = { name };

    if (projectId) {
      body.mixins = {
        [PROJECT_MIXIN_KEY]: { projectid: projectId },
      };
      body.metadata = {
        mixins: { [PROJECT_MIXIN_KEY]: PROJECT_MIXIN_SCHEMA },
      };
    }

    const response = await this.apiClient.authenticatedFetch(
      this.baseUrl(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      'customer-saas',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to create shopping list: ${response.statusText} ${errorDetails}`);
    }

    // API returns { id } — fetch full object
    const created = await response.json();
    const full = await this.getList(created.id ?? created);
    return full ?? ({ id: created.id, name, items: [] } as any);
  }

  async deleteList(listId: string): Promise<void> {
    const response = await this.apiClient.authenticatedFetch(
      `${this.baseUrl()}/${listId}`,
      { method: 'DELETE' },
      'customer-saas',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to delete shopping list: ${response.statusText} ${errorDetails}`);
    }
  }

  async addItem(listId: string, productId: string, quantity: number): Promise<EmporixShoppingListItem> {
    const body = {
      product: { id: productId },
      quantity,
    };

    const response = await this.apiClient.authenticatedFetch(
      `${this.baseUrl()}/${listId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      'customer-saas',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to add item to shopping list: ${response.statusText} ${errorDetails}`);
    }

    return response.json();
  }

  async removeItem(listId: string, itemId: string): Promise<void> {
    const response = await this.apiClient.authenticatedFetch(
      `${this.baseUrl()}/${listId}/items/${itemId}`,
      { method: 'DELETE' },
      'customer-saas',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to remove item from shopping list: ${response.statusText} ${errorDetails}`);
    }
  }

  async setProjectMixin(listId: string, projectId: string): Promise<void> {
    const existing = await this.getList(listId);
    if (!existing) throw new Error(`Shopping list ${listId} not found`);

    const updated = {
      ...existing,
      mixins: {
        ...(existing.mixins ?? {}),
        [PROJECT_MIXIN_KEY]: { projectid: projectId },
      },
      metadata: {
        ...(existing.metadata ?? {}),
        mixins: {
          ...(existing.metadata?.mixins ?? {}),
          [PROJECT_MIXIN_KEY]: PROJECT_MIXIN_SCHEMA,
        },
      },
    };

    const response = await this.apiClient.authenticatedFetch(
      `${this.baseUrl()}/${listId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      },
      'customer-saas',
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to update shopping list mixin: ${response.statusText} ${errorDetails}`);
    }
  }
}

export default EmporixShoppingListApi;
