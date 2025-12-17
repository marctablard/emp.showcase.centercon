import { cache } from 'react';
import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { StoredToken } from '@/platform/integrations/types/auth';
import { EmporixAnonymousTokenResponse, EmporixCustomerTokenResponse } from '../../model/oauth';
import type { EmporixOAuthApi } from '../../oauth/EmporixOAuthApi';
import { TokenStore } from './EmporixTokenManagerAbstract';
import { EmporixTokenManagerAbstract } from './EmporixTokenManagerAbstract';

@injectable('EmporixTokenManager', 'Singleton')
class EmporixTokenManagerSSR extends EmporixTokenManagerAbstract {
  constructor(@inject('EmporixOAuthApi') oauthApi: EmporixOAuthApi) {
    super(oauthApi);
  }

  public clearTokens(_tenant: string): void {
    // nothing to do
  }

  protected fetchCachedAnonymousToken = cache(
    async (
      tenant: string,
      clientId: string,
      _timestamp?: number,
    ): Promise<StoredToken<EmporixAnonymousTokenResponse>> => {
      console.log('fetching anonymous token');
      const now = Date.now();
      const response = await this.oauthApi.getAnonymousToken(tenant, clientId);
      return {
        token: response,
        expiryAt: now + response.expires_in * 1000,
        refreshExpiryAt: response.refresh_token_expires_in ? now + response.refresh_token_expires_in * 1000 : undefined,
      };
    },
  );

  protected refreshCachedAnonymousToken = cache(
    async (
      tenant: string,
      clientId: string,
      refreshToken: string,
      _expiryAt?: number,
    ): Promise<StoredToken<EmporixAnonymousTokenResponse>> => {
      const response = await this.oauthApi.refreshAnonymousToken(tenant, refreshToken, clientId);
      const now = Date.now();
      return {
        token: response,
        expiryAt: now + response.expires_in * 1000,
        refreshExpiryAt: response.refresh_token_expires_in ? now + response.refresh_token_expires_in * 1000 : undefined,
      };
    },
  );

  async getAnonymousToken(tenant: string, clientId: string): Promise<{ accessToken: string; sessionId: string }> {
    console.log('getting anonymous token');
    // otherwise check their anonymous token
    let ssrAnonymousToken = await this.fetchCachedAnonymousToken(tenant, clientId);
    // otherwise we use our own token
    if (!this.checkAccessToken(ssrAnonymousToken)) {
      ssrAnonymousToken = await this.refreshCachedAnonymousToken(
        tenant,
        clientId,
        ssrAnonymousToken.token.refresh_token!,
        ssrAnonymousToken.expiryAt,
      );
    }
    if (!this.checkAccessToken(ssrAnonymousToken)) {
      ssrAnonymousToken = await this.fetchCachedAnonymousToken(tenant, clientId, ssrAnonymousToken.expiryAt);
    }
    return {
      accessToken: ssrAnonymousToken.token.access_token,
      sessionId: ssrAnonymousToken.token.session_id,
    };
  }

  public async getSessionToken(
    _tenant: string,
    _clientId: string,
  ): Promise<{ accessToken: string; saasToken?: string; sessionId: string }> {
    throw new Error("Customer authentication is not allowed, since SSR-Context can't provide Cookies in Response");
  }

  protected createCustomerToken(
    _tenant: string,
    _clientId: string,
    _credentials: { username: string; password: string },
  ): Promise<{
    token: {
      sessionId: string;
      saas_token: string;
      session_id: string;
      access_token: string;
      token_type: string;
      expires_in: number;
      scope: string;
      refresh_token?: string;
      refresh_token_expires_in?: number;
    };
    expiryAt: number;
    refreshExpiryAt: number | undefined;
  }> {
    throw new Error("Customer authentication is not allowed, since SSR-Context can't provide Cookies in Response");
  }

  protected fetchCustomerToken(
    _customerToken: StoredToken<EmporixCustomerTokenResponse> | undefined,
    _tenant: string,
    _username: string | undefined,
    _password: string | undefined,
    _clientId: string,
  ): Promise<StoredToken<EmporixCustomerTokenResponse>> {
    throw new Error("Customer authentication is not allowed, since SSR-Context can't provide Cookies in Response");
  }

  protected async writeTokens(_tokens: TokenStore, _tenant: string): Promise<void> {
    // do nothing
  }
  protected async readTokens(_tenant: string): Promise<TokenStore> {
    return {};
  }
}
export default EmporixTokenManagerSSR;
