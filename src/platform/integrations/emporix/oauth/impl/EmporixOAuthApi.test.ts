import EmporixOAuthApi from './EmporixOAuthApi';
import { EmporixConfig } from '../../config';
import { Container, inject } from 'inversify';
import { EmporixTokenManagerAbstract, TokenStore } from '../../common/impl/EmporixTokenManagerAbstract';
import { StoredToken } from '@/platform/integrations/types/auth';
import { TokenManager } from '../../common/TokenManager';
import type { OAuthApi } from '../OAuthApi';

// Create a test config implementation
class TestEmporixConfig implements EmporixConfig {
  baseUrl: string = process.env.NEXT_EMPORIX_TEST_BASE_URL || 'https://api.emporix.io';
  tenant: string = process.env.NEXT_EMPORIX_TEST_TENANT || 'showcasetest';
  clientId: string = process.env.NEXT_EMPORIX_TEST_CLIENT_ID || '';
  clientSecret: string = process.env.NEXT_EMPORIX_TEST_CLIENT_SECRET || '';
}

class TestTokenManager extends EmporixTokenManagerAbstract {
  constructor(@inject('EmporixOAuthApi') oauthApi: OAuthApi) {
    super(oauthApi);
  }
  
  protected readTokens(): Promise<TokenStore> {
    throw new Error('Method not implemented.');
  }
  
  protected writeTokens(tokens: TokenStore): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  private tokenStore: Map<string, StoredToken<any>> = new Map();
  
  protected async readToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service'): Promise<T | undefined> {
    return this.tokenStore.get(type) as T | undefined;
  }
  
  protected writeToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service', token: T): Promise<void> {
    this.tokenStore.set(type, token);
    return Promise.resolve();
  }
  
  public clearTokens(): void {
    this.tokenStore.clear();
  }
}

describe('EmporixOAuthApi', () => {
  let container: Container;
  let oauthApi: EmporixOAuthApi;
  let config: TestEmporixConfig;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the container with our test config
    container = new Container();
    container.bind<EmporixConfig>('EmporixConfig').to(TestEmporixConfig);
    container.bind<EmporixOAuthApi>('EmporixOAuthApi').to(EmporixOAuthApi);
    container.bind<TokenManager>('EmporixTokenManager').to(TestTokenManager);
    
    // Get instances from the container
    oauthApi = container.get<EmporixOAuthApi>('EmporixOAuthApi');
    config = container.get<EmporixConfig>('EmporixConfig') as TestEmporixConfig;
    
  });
  
  describe('getAnonymousToken', () => {
    it('should fetch an anonymous token', async () => {
      // Execute
      const result = await oauthApi.getAnonymousToken(config.tenant, config.clientId);
      
      // Verify the response structure
      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
      expect(typeof result.expires_in).toBe('number');
      expect(result.scope).toBeDefined();
      expect(result.sessionId).toBeDefined();
    });
    
    it('should handle errors when fetching an anonymous token', async () => {
      // Execute with an invalid client ID
      await expect(oauthApi.getAnonymousToken(config.tenant, 'invalid-client-id'))
        .rejects.toThrow();
    });
  });
  
  describe('refreshAnonymousToken', () => {
    it('should refresh an anonymous token', async () => {    
      // First get an anonymous token
      const anonymousTokenResponse = await oauthApi.getAnonymousToken(config.tenant, config.clientId);
      const refreshToken = anonymousTokenResponse.refresh_token;
      
      // Skip if no refresh token is available
      if (!refreshToken) {
        console.log('Skipping test: No refresh token available');
        return;
      }
      
      // Execute with the real refresh token
      const result = await oauthApi.refreshAnonymousToken(
        config.tenant, 
        refreshToken,
        config.clientId
      );
      
      // Verify the response structure
      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
      expect(typeof result.expires_in).toBe('number');
      expect(result.scope).toBeDefined();
      expect(result.sessionId).toBeDefined();
    });
  });
  
  describe('getCustomerToken', () => {
    it('should handle customer token request correctly', async () => {
      // Skip test if no client ID is available
      if (!config.clientId) {
        console.log('Skipping test: No client ID available');
        return;
      }
      
      // First get an anonymous token
      const anonymousTokenResponse = await oauthApi.getAnonymousToken(config.tenant, config.clientId);
      const anonymousToken = anonymousTokenResponse.access_token;
      
      // We can't test with real credentials, but we can verify the call throws the expected error
      // with invalid credentials
      await expect(oauthApi.getCustomerToken(
        config.tenant,
        anonymousToken,
        'test@example.com',
        'invalid-password'
      )).rejects.toThrow();
    });
  });
  
  describe('refreshCustomerToken', () => {
    it('should handle customer token refresh request correctly', async () => {
      // We can't test with real refresh tokens, but we can verify the call throws the expected error
      // with an invalid refresh token
      await expect(oauthApi.refreshCustomerToken(
        config.tenant,
        'invalid-refresh-token'
      )).rejects.toThrow();
    });
  });
  
  describe('getServiceAccessToken', () => {
    it('should fetch a service access token', async () => {
      // Skip test if no client credentials are available
      if (!config.clientId || !config.clientSecret) {
        console.log('Skipping test: No client credentials available');
        return;
      }
      
      // Execute with real credentials
      const result = await oauthApi.getServiceAccessToken(
        config.tenant,
        config.clientId,
        config.clientSecret
      );
      
      // Verify the response structure
      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
      expect(typeof result.expires_in).toBe('number');
      expect(result.scope).toBeDefined();
    });
    
    it('should handle errors with invalid credentials', async () => {
      await expect(oauthApi.getServiceAccessToken(
        config.tenant,
        'invalid-client-id',
        'invalid-client-secret'
      )).rejects.toThrow();
    });
  });
});
