import { inject } from 'inversify';
import { EmporixTokenManagerAbstract, TokenStore } from './EmporixTokenManagerAbstract';
import { StoredToken } from '@/platform/integrations/types/auth';
import type { OAuthApi } from '../../oauth/OAuthApi';

/**
 * A reusable test implementation of EmporixTokenManager for testing purposes.
 * This class provides a simple in-memory token store and can be used across all tests
 * that require a TokenManager implementation.
 */
export class EmporixTestTokenManager extends EmporixTokenManagerAbstract {
  private tokenStore: Map<string, any> = new Map();

  constructor(@inject('EmporixOAuthApi') oauthApi: OAuthApi) {
    super(oauthApi);
  }

  protected async readTokens(): Promise<TokenStore> {
    return {
      anonymousToken: this.tokenStore.get('anonymous'),
      customerToken: this.tokenStore.get('customer'),
      serviceToken: this.tokenStore.get('service'),
    };
  }

  protected async readToken<T extends StoredToken<K>, K>(
    type: 'anonymous' | 'customer' | 'service',
  ): Promise<T | undefined> {
    return this.tokenStore.get(type) as T | undefined;
  }

  protected async writeToken<T extends StoredToken<K>, K>(
    type: 'anonymous' | 'customer' | 'service',
    token: T | undefined,
  ): Promise<void> {
    this.tokenStore.set(type, token);
  }

  protected async writeTokens(tokens: TokenStore): Promise<void> {
    if (tokens.anonymousToken) this.tokenStore.set('anonymous', tokens.anonymousToken);
    if (tokens.customerToken) this.tokenStore.set('customer', tokens.customerToken);
    if (tokens.serviceToken) this.tokenStore.set('service', tokens.serviceToken);
  }

  // Helper method to clear the token store (useful for test cleanup)
  public clearTokens(): void {
    this.tokenStore.clear();
  }
}
