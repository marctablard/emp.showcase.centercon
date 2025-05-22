/**
 * OAuth API Interface for Emporix
 * Based on the OAuth Service OpenAPI specification
 */

export interface OAuthApi {
  /**
   * Get an anonymous token
   * Used by the storefront to access public resources with a reading scope.
   * It allows customers to browse products, view prices or add products to cart.
   * The anonymous token is not associated with any customer.
   * 
   * @param tenant The tenant ID
   * @param clientId Client ID for anonymous access
   * @returns Promise with the anonymous token response
   */
  getAnonymousToken(tenant: string, clientId: string): Promise<AnonymousTokenResponse>;

  /**
   * Refresh an anonymous token
   * Sends an authentication request and returns new anonymous token with same session ID attached.
   * 
   * @param tenant The tenant ID
   * @param refreshToken Refresh token from the original anonymous token response
   * @param clientId Client ID for anonymous access
   * @returns Promise with the refreshed anonymous token response
   */
  refreshAnonymousToken(tenant: string, refreshToken: string, clientId: string): Promise<AnonymousTokenResponse>;

  /**
   * Get a customer token (SaaS token)
   * A JSON Web Token (JWT) which contains encrypted customer data.
   * The SaaS token works similarly to the anonymous token, but it is associated with a specific customer.
   * 
   * @param tenant The tenant ID
   * @param anonymousToken The anonymous token
   * @param username Customer username/email
   * @param password Customer password
   * @returns Promise with the customer token response
   */
  getCustomerToken(tenant: string, anonymousToken: string, username: string, password: string): Promise<CustomerTokenResponse>;

  /**
   * Refresh a customer token
   * Sends an authentication request and returns a refreshed customer token.
   * 
   * @param tenant The tenant ID
   * @param accessToken Current access token
   * @param refreshToken Refresh token from the original customer token response
   * @param legalEntityId Optional legal entity ID
   * @returns Promise with the refreshed customer token response
   */
  refreshCustomerToken(tenant: string, accessToken: string, refreshToken: string, legalEntityId?: string): Promise<CustomerTokenResponse>;

  /**
   * Get a service access token
   * Needed to access the Emporix services such as adding new products, managing categories or modifying prices.
   * 
   * @param tenant The tenant ID
   * @param clientId Client ID for service access
   * @param clientSecret Client secret for service access
   * @returns Promise with the service access token response
   */
  getServiceAccessToken(tenant: string, clientId: string, clientSecret: string): Promise<ServiceAccessTokenResponse>;
}

/**
 * Response type for anonymous token requests
 */
export interface AnonymousTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  sessionId?: string;
}

/**
 * Response type for customer token requests
 */
export interface CustomerTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  saas_token: string;
  refreshToken?: string; // mismatching casing from original spec
  refreshTokenExpiresIn?: number;
  sessionId?: string;
}

/**
 * Response type for service access token requests
 */
export interface ServiceAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
