import { inject } from 'inversify';
import type { EmporixConfig } from '../config';
import { TokenManager } from '../TokenManager'
import apis from '../..';
import { injectable } from '@/platform/core/di/injectable';

/**
 * Main client for interacting with Emporix APIs
 * Handles authentication and provides access to various API endpoints
 */
@injectable('EmporixApiInvoker', 'Singleton')
class EmporixApiInvoker {
  private config: EmporixConfig;

  constructor(
    @inject('EmporixConfig') config: EmporixConfig
  ) {
    this.config = config;
  }

  /**
   * Get an anonymous token for accessing public resources
   * @returns Promise with the token string
   */
  async getAnonymousToken(): Promise<string> {
    const tokenManager = await apis.get<TokenManager>("EmporixTokenManager");
    return tokenManager.getAnonymousToken(this.config.tenant, this.config.clientId);
  }

  /**
   * Get a customer token for authenticated user access
   * @param password Customer password
   * @returns Promise with access token and SaaS token
   */
  async getCustomerToken(username: string, password: string): Promise<{accessToken: string, saasToken: string}> {
    const tokenManager = await apis.get<TokenManager>("EmporixTokenManager");
    return tokenManager.getCustomerToken(this.config.tenant, this.config.clientId, username, password);
  }

  /**
   * Get a service access token for administrative operations
   * @param clientSecret Optional client secret (uses config value if not provided)
   * @returns Promise with the token string
   */
  async getServiceAccessToken(clientId?: string, clientSecret?: string): Promise<string> {
    const cid = clientId || this.config.clientId;
    const secret = clientSecret || this.config.clientSecret;
    
    if (!cid || !secret) {
      throw new Error('Client ID and Client Secret are required for service access token');
    }

    const tokenManager = await apis.get<TokenManager>("EmporixTokenManager");
    return tokenManager.getServiceAccessToken(this.config.tenant, cid, secret);
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
    tokenType: 'anonymous' | 'customer' | 'service' = 'anonymous',
    credentials?: { username: string; password: string }
  ): Promise<Response> {
    let token: string;
    
    // Get the appropriate token based on the token type
    switch (tokenType) {
      case 'anonymous':
        token = await this.getAnonymousToken();
        break;
      case 'customer':
        if (!credentials) {
          throw new Error('Customer credentials are required for customer token authentication');
        }
        const customerTokens = await this.getCustomerToken(credentials.username, credentials.password);
        token = customerTokens.accessToken;
        break;
      case 'service':
        token = await this.getServiceAccessToken();
        break;
      default:
        throw new Error(`Unknown token type: ${tokenType}`);
    }
    
    // Add authorization header to the request
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
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
    const tokenManager = await apis.get<TokenManager>("EmporixTokenManager");
    tokenManager.clearTokens();
  }
}
export default EmporixApiInvoker;