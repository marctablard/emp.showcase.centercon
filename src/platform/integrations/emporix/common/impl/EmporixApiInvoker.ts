import { inject } from 'inversify';
import type { EmporixConfig } from '../../config';
import type { TokenManager } from '../TokenManager'
import { injectable } from '@/platform/core/di/injectable';

/**
 * Main client for interacting with Emporix APIs
 * Handles authentication and provides access to various API endpoints
 */
@injectable('EmporixApiInvoker', 'Singleton')
class EmporixApiInvoker {
  private config: EmporixConfig;
  private tokenManager: TokenManager;

  constructor(
    @inject('EmporixConfig') config: EmporixConfig,
    @inject('EmporixTokenManager') tokenManager: TokenManager
  ) {
    this.config = config;
    this.tokenManager = tokenManager;
  }

  /**
   * Get an anonymous token for accessing public resources
   * @returns Promise with the token string
   */
  async getAnonymousToken(): Promise<{ accessToken: string, sessionId: string }> {
    return this.tokenManager.getAnonymousToken(this.config.tenant, this.config.clientId);
  }

  /**
   * Get a customer token for authenticated user access
   * @param credentials Optional customer credentials (username and password)
    * @returns Promise with the token string and SaaS token
    */
  async getCustomerToken(credentials?: { username: string; password: string }): Promise<{ accessToken: string; saasToken: string, sessionId: string }> {
    return this.tokenManager.getCustomerToken(this.config.tenant, this.config.clientId, credentials);
  }


  /**
   * Get a service access token for administrative operations
   * @param clientSecret Optional client secret (uses config value if not provided)
   * @returns Promise with the token string
   */
  async getServiceAccessToken(scopes?: string[]): Promise<string> {
    if (!this.config.serverClientId || !this.config.serverClientSecret) {
      throw new Error("Service Credentials not available");
    }
    return this.tokenManager.getServiceAccessToken(this.config.tenant, this.config.serverClientId, this.config.serverClientSecret, scopes);
  }

  /**
   * Create a fetch request with the appropriate authentication headers
   * @param url API endpoint URL
   * @param options Fetch options
   * @param tokenType Type of token to use for authentication
   * @returns Promise with the fetch response
   */
  /**
   * Create a fetch request with the appropriate authentication headers
   * @param url API endpoint URL
   * @param options Fetch options
   * @param tokenType Type of token to use for authentication
   * @param credentials Optional credentials for customer token (username/password)
   * @returns Promise with the fetch response
   */
  async authenticatedFetch(
    url: string,
    options: RequestInit = {},
    tokenType: 'anonymous' | 'customer' | 'customer-saas' | 'service' = 'anonymous',
    authOptions?: {
      credentials?: { username: string; password: string },
      scopes?: string[]
    }
  ): Promise<Response> {
    let token: string;

    // Add authorization header to the request
    let headers = {
      ...options.headers,
    };
    // Get the appropriate token based on the token type
    switch (tokenType) {
      case 'anonymous':
        const anonymousToken = await this.getAnonymousToken();
        token = anonymousToken.accessToken;

        headers = {
          ...options.headers,
          'session-id': `${anonymousToken.sessionId}`
        }
        break;
      case 'customer':
      case 'customer-saas':
        const customerTokens = await this.getCustomerToken(authOptions?.credentials);
        token = customerTokens.accessToken;
        if (tokenType === 'customer-saas') {
          headers = {
            ...options.headers,
            'saas-token': `Bearer ${token}`
          }
        }
        break;
      case 'service':
        token = await this.getServiceAccessToken(authOptions?.scopes);
        break;
      default:
        throw new Error(`Unknown token type: ${tokenType}`);
    }

    // Add authorization header to the request
    headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
    // Make the authenticated request
    return fetch(`${this.config.baseUrl}/${url}`, {
      ...options,
      headers
    });
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    this.tokenManager.clearTokens();
  }
}
export default EmporixApiInvoker;