import { injectable } from '@/platform/core/di/injectable';
import { OAuthApi } from '../OAuthApi';
import { EmporixAnonymousTokenResponse, EmporixCustomerTokenResponse, EmporixAccessTokenResponse } from '../../model/oauth'

/**
 * Implementation of the Emporix OAuth API
 */
@injectable('EmporixOAuthApi', 'Singleton')
class EmporixOAuthApi implements OAuthApi {
  private readonly baseUrl: string = 'https://api.emporix.io';

  /**
   * Get an anonymous token
   * @param tenant The tenant ID
   * @param clientId Client ID for anonymous access
   * @returns Promise with the anonymous token response
   */
  async getAnonymousToken(tenant: string, clientId: string): Promise<EmporixAnonymousTokenResponse> {
    const url = `${this.baseUrl}/customerlogin/auth/anonymous/login?tenant=${tenant}&client_id=${clientId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to get anonymous token: ${response.statusText} - ${message}`);
    }

    return await response.json() as EmporixAnonymousTokenResponse;
  }
  
  /**
   * Refresh an anonymous token
   * @param tenant The tenant ID
   * @param refreshToken Refresh token from the original anonymous token response
   * @param clientId Client ID for anonymous access
   * @returns Promise with the refreshed anonymous token response
   */
  async refreshAnonymousToken(tenant: string, refreshToken: string, clientId: string): Promise<EmporixAnonymousTokenResponse> {
    const url = `${this.baseUrl}/customerlogin/auth/anonymous/refresh?tenant=${tenant}&refresh_token=${refreshToken}&client_id=${clientId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to refresh anonymous token: ${response.statusText} - ${message}`);
    }

    return await response.json() as EmporixAnonymousTokenResponse;
  }

 
  /**
   * Get a customer token (and SaaS token)
   * @param tenant The tenant ID
   * @param username Customer username/email
   * @param password Customer password
   * @returns Promise with the customer token response
   */
  async getCustomerToken(tenant: string, accessToken: string, username: string, password: string): Promise<EmporixCustomerTokenResponse> {
    const url = `${this.baseUrl}/customer/${tenant}/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        email: username,
        password: password
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to get customer token: ${response.statusText} - ${message}`);
    }

    return await response.json() as EmporixCustomerTokenResponse;
  }

  
  /**
   * Refresh a customer token
   * @param tenant The tenant ID
   * @param refreshToken Refresh token from the original customer token response
   * @returns Promise with the refreshed customer token response
   */
  async refreshCustomerToken(tenant: string, refreshToken: string): Promise<EmporixCustomerTokenResponse> {
    const url = `${this.baseUrl}/customer/${tenant}/refreshauthtoken/refresh?refresh_token=${refreshToken}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to refresh customer token: ${response.statusText} - ${message}`);
    }
    
    return await response.json() as EmporixCustomerTokenResponse;
  }

  /**
   * Get a service access token
   * @param tenant The tenant ID
   * @param clientId Client ID for service access
   * @param clientSecret Client secret for service access
   * @returns Promise with the service access token response
   */
  async getServiceAccessToken(tenant: string, clientId: string, clientSecret: string, scopes?: string[]): Promise<EmporixAccessTokenResponse> {
    const url = `${this.baseUrl}/oauth/token`;
    
    // Create URL-encoded form data for OAuth token request
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('scope', `tenant=${tenant}` + (scopes ? ` ${scopes.join(' ')}` : ''));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get service access token: ${response.statusText}`);
    }
    return await response.json() as EmporixAccessTokenResponse;
  }
}

export default EmporixOAuthApi;
