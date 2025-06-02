import { EmporixTokenManagerAbstract, TokenStore } from './EmporixTokenManagerAbstract';
import { injectable } from '@/platform/core/di/injectable';

const LOCAL_STORAGE_KEY = 'emporix-token';

/**
 * TokenManager for handling Emporix API tokens
 * Manages token caching and refreshing
 */
@injectable('EmporixTokenManager', 'Singleton')
class EmporixTokenManagerClient extends EmporixTokenManagerAbstract {
  protected async customerAuthAllowed(): Promise<boolean> {
    return true;
  }

  protected async readTokens(): Promise<TokenStore> {
    const tokenStoreString: string | null = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!tokenStoreString) {
      return Promise.resolve({});
    }
    const tokenStore: TokenStore = JSON.parse(tokenStoreString);
    return tokenStore;
  }

  protected async writeTokens(tokens: TokenStore): Promise<void> {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tokens));
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export default EmporixTokenManagerClient;
