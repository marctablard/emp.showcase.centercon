import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { StoredToken } from '@/platform/integrations/types/auth';
import { EmporixCustomerTokenResponse } from '../../model/oauth';
import type { OAuthApi } from '../../oauth/OAuthApi';
import { TokenStore } from './EmporixTokenManagerAbstract';
import { EmporixTokenManagerAbstract } from './EmporixTokenManagerAbstract';

@injectable('EmporixTokenManager', 'Singleton')
class EmporixTokenManagerSSR extends EmporixTokenManagerAbstract {
  private ssrToken: Record<string, TokenStore> = {};

  constructor(@inject('EmporixOAuthApi') oauthApi: OAuthApi) {
    super(oauthApi);
  }

  public clearTokens(tenant: string): void {
    this.ssrToken[tenant] = {};
  }

  public async getSessionToken(
    tenant: string,
    clientId: string,
  ): Promise<{ accessToken: string; saasToken?: string; sessionId: string }> {
    const customerToken = await this.readToken<StoredToken<EmporixCustomerTokenResponse>, EmporixCustomerTokenResponse>(
      'customer',
      tenant,
    );
    // first check client's customer token
    if (this.checkAccessToken(customerToken)) {
      return { accessToken: customerToken!.token.access_token, sessionId: customerToken!.token.session_id };
    }
    // otherwise check their anonymous token
    const anonymousToken = await this.readToken<
      StoredToken<EmporixCustomerTokenResponse>,
      EmporixCustomerTokenResponse
    >('anonymous', tenant);
    if (this.checkAccessToken(anonymousToken)) {
      return { accessToken: anonymousToken!.token.access_token, sessionId: anonymousToken!.token.session_id };
    }
    // otherwise we use our own token
    const ssrAnonymousToken = this.ssrToken[tenant]?.anonymousToken;
    if (!this.checkAccessToken(ssrAnonymousToken)) {
      const freshSsrAnonymousToken = await this.fetchAnonymousToken(ssrAnonymousToken, tenant, clientId);
      // ...and store it globally, so it can be reused
      this.ssrToken[tenant].anonymousToken = freshSsrAnonymousToken;
    }
    return {
      accessToken: this.ssrToken[tenant].anonymousToken!.token.access_token,
      sessionId: this.ssrToken[tenant].anonymousToken!.token.session_id,
    };
  }

  public async getCustomerToken(
    tenant: string,
    clientId: string,
    credentials?: { username: string; password: string },
  ): Promise<{ accessToken: string; saasToken?: string; sessionId: string } | null> {
    return null;
  }

  protected async writeTokens(tokens: TokenStore, tenant: string): Promise<void> {
    // strip customer Token, since that will be from the the SSR Clients cookie
    tokens.customerToken = undefined;
    this.ssrToken[tenant] = tokens;
  }

  protected async readTokens(tenant: string): Promise<TokenStore> {
    const cookieStore = await cookies();
    const tokenCookie: RequestCookie | undefined = cookieStore.get(this.buildStorageKey(tenant));
    if (!tokenCookie) {
      return {};
    }
    const b64Token = tokenCookie.value;
    const tokens: TokenStore = JSON.parse(Buffer.from(b64Token, 'base64').toString('utf-8'));
    return tokens;
  }
}

export default EmporixTokenManagerSSR;
