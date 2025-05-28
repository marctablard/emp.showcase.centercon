/**
 * TokenManager for handling Emporix API tokens
 * Manages token caching and refreshing
 */
export interface TokenManager {
  
  /**
   * Get a valid anonymous token, refreshing if necessary
   * @param tenant The tenant ID
   * @returns Promise with the token string
   */
  getAnonymousToken(tenant: string, clientId: string): Promise<{ accessToken: string, sessionId: string }>
  
  /**
   * Get a valid customer token, refreshing if necessary
   * @param tenant The tenant ID
   * @param username Customer username/email
   * @param password Customer password
   * @returns Promise with the token string and SaaS token
   */
  getCustomerToken(tenant: string, clientId: string, credentials? : {username: string, password: string}): Promise<{accessToken: string, saasToken: string, sessionId: string}> ;
  
  /**
   * Get a valid service access token, refreshing if necessary
 * @param tenant The tenant ID
 * @param clientId Client ID for service access
   * @param clientSecret Client secret for service access
   * @returns Promise with the token string
   */
  getServiceAccessToken(tenant: string, clientId: string, clientSecret: string, scopes?: string[]): Promise<string>
  
  /**
   * Clear all stored tokens
   */
  clearTokens(): void
}
