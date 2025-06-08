import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { buildCurl } from '@/platform/core/utils/curl';
import type { EmporixConfig } from '../../config';
import type { TokenManager } from '../TokenManager';

/**
 * Main client for interacting with Emporix APIs
 * Handles authentication and provides access to various API endpoints
 */
@injectable('EmporixApiInvoker', 'Singleton')
class EmporixApiInvoker {
  private config: EmporixConfig;
  private tokenManager: TokenManager;
  private debugCurl: boolean = false;

  constructor(
    @inject('EmporixConfig') config: EmporixConfig,
    @inject('EmporixTokenManager') tokenManager: TokenManager,
  ) {
    this.config = config;
    this.tokenManager = tokenManager;
  }

  /**
   * Get an anonymous token for accessing public resources
   * @returns Promise with the token string
   */
  async getAnonymousToken(): Promise<{ accessToken: string; sessionId: string }> {
    return this.tokenManager.getAnonymousToken(this.config.tenant, this.config.clientId);
  }

  /**
   * Get a service access token for administrative operations
   * @param clientSecret Optional client secret (uses config value if not provided)
   * @returns Promise with the token string
   */
  async getServiceAccessToken(scopes?: string[]): Promise<string> {
    if (!this.config.serverClientId || !this.config.serverClientSecret) {
      throw new Error('Service Credentials not available');
    }
    return this.tokenManager.getServiceAccessToken(
      this.config.tenant,
      this.config.serverClientId,
      this.config.serverClientSecret,
      scopes,
    );
  }

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
    tokenType: 'public' | 'session' | 'customer-saas' | 'service' = 'public',
    authOptions?: {
      credentials?: { username: string; password: string };
      scopes?: string[];
    },
  ): Promise<Response> {
    let token: string;

    // Add authorization header to the request
    let headers = {
      ...options.headers,
    };
    // Get the appropriate token based on the token type
    switch (tokenType) {
      case 'public':
        const anonymousToken = await this.tokenManager.getAnonymousToken(this.config.tenant, this.config.clientId);
        token = anonymousToken.accessToken;
        break;
      case 'customer-saas':
      case 'session':
        const sessionToken = await this.tokenManager.getSessionToken(
          this.config.tenant,
          this.config.clientId,
          authOptions?.credentials,
        );
        token = sessionToken.accessToken;
        if (tokenType === 'customer-saas') {
          if (sessionToken.saasToken) {
            headers = {
              ...headers,
              'saas-token': `${sessionToken.saasToken}`,
            };
          } else {
            throw new Error('No SaaS token available');
          }
        } else {
          headers = {
            ...headers,
            'session-id': `${sessionToken.sessionId}`,
          };
        }
        break;
      case 'service':
        token = await this.tokenManager.getServiceAccessToken(
          this.config.tenant,
          this.config.clientId,
          this.config.clientSecret,
          authOptions?.scopes,
        );
        break;
      default:
        throw new Error(`Unknown token type: ${tokenType}`);
    }

    // Add authorization header to the request
    headers = {
      ...headers,
      Authorization: `Bearer ${token}`,
    };

    return this.fetch(url, { ...options, headers });
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    url = `${this.config.baseUrl}/${url}`;

    if (this.debugCurl) {
      console.debug(buildCurl(url, options));
    }
    // no recursion, this is the globals fetch!
    return fetch(url, options);
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    this.tokenManager.clearTokens(this.config.tenant);
  }
}
export default EmporixApiInvoker;
