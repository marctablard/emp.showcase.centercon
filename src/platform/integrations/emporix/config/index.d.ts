/**
 * Configuration for Emporix API
 */
export interface EmporixConfig {
  /**
   * Base URL for the Emporix API
   * Default: https://api.emporix.io
   */
  baseUrl: string;
  
  /**
   * Tenant ID for the Emporix API
   */
  tenant: string;
  
  /**
   * Client ID for service access
   */
  clientId: string;
  
  /**
   * Client secret for service access
   */
  clientSecret: string;

  /**
   * Client ID for service access (for server-side)
   */
  serverClientId?: string;
  
  /**
   * Client secret for service access (for server-side)
   */
  serverClientSecret?: string;
}
