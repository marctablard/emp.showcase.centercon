import type { StoredToken } from '@/platform/integrations/types/auth';
import { EmporixTokenManagerAbstract, TokenStore } from './EmporixTokenManagerAbstract';
import { AnonymousTokenResponse, CustomerTokenResponse, ServiceAccessTokenResponse } from '../../oauth/OAuthApi';
import { injectable } from '@/platform/core/di/injectable';

const LOCAL_STORAGE_KEY = 'emporix-token';

/**
 * TokenManager for handling Emporix API tokens
 * Manages token caching and refreshing
 */
 @injectable('EmporixTokenManager', 'Singleton')
class EmporixTokenManagerClient extends EmporixTokenManagerAbstract {
  

  protected writeToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service', token: T): Promise<void> {
    const tokenStoreString : string | null = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!tokenStoreString) {
      return Promise.resolve();
    }
    const tokenStore : TokenStore = JSON.parse(tokenStoreString);
    switch (type) {
      case 'anonymous':
        tokenStore.anonymousToken = token as StoredToken<AnonymousTokenResponse>;
        break;
      case 'customer':
        tokenStore.customerToken = token as StoredToken<CustomerTokenResponse>;
        break;
      case 'service':
        tokenStore.serviceToken = token as StoredToken<ServiceAccessTokenResponse>;
        break;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tokenStore));
    return Promise.resolve();
  }

  protected readToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service'): Promise<T | undefined> {
    const tokenStoreString : string | null = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!tokenStoreString) {
      return Promise.resolve(undefined);
    }
    const tokenStore : TokenStore = JSON.parse(tokenStoreString);
    switch (type) {
      case 'anonymous':
        return Promise.resolve(tokenStore.anonymousToken as T);
      case 'customer':
        return Promise.resolve(tokenStore.customerToken as T);
      case 'service':
        return Promise.resolve(tokenStore.serviceToken as T);
    }
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export default EmporixTokenManagerClient;
