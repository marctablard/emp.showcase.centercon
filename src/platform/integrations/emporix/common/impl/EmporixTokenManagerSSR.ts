import { cookies } from 'next/headers';
import { StoredToken } from '@/platform/integrations/types/auth';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { TokenStore } from './EmporixTokenManagerAbstract';
import { injectable } from '@/platform/core/di/injectable';
import { inject } from 'inversify';
import type { OAuthApi } from '../../oauth/OAuthApi';
import { EmporixTokenManagerAbstract } from './EmporixTokenManagerAbstract';
import { EmporixCustomerTokenResponse } from '../../model/oauth';

@injectable('EmporixTokenManager', 'Singleton')
class EmporixTokenManagerSSR extends EmporixTokenManagerAbstract {

    private ssrToken: TokenStore = {};

    constructor(@inject('EmporixOAuthApi') oauthApi: OAuthApi) {
        super(oauthApi);
    }

    public clearTokens(): void {
        this.ssrToken = {};
    }

    public async getSessionToken(tenant: string, clientId: string): Promise<{ accessToken: string; saasToken?: string; sessionId: string }> {
        let customerToken = await this.readToken<StoredToken<EmporixCustomerTokenResponse>, EmporixCustomerTokenResponse>('customer');
        // first check client's customer token
        if (this.checkAccessToken(customerToken)) {
            return { accessToken: customerToken!.token.access_token, sessionId: customerToken!.token.session_id };
        }
        // otherwise check their anonymous token
        let anonymousToken = await this.readToken<StoredToken<EmporixCustomerTokenResponse>, EmporixCustomerTokenResponse>('anonymous');
        if (this.checkAccessToken(anonymousToken)) {
            return { accessToken: anonymousToken!.token.access_token, sessionId: anonymousToken!.token.session_id };
        }
        // otherwise we use our own token
        if (!this.checkAccessToken(this.ssrToken.anonymousToken)) {
            const freshSsrAnonymousToken = await this.fetchAnonymousToken(this.ssrToken.anonymousToken, tenant, clientId);
            // ...and store it globally, so it can be reused
            this.ssrToken.anonymousToken = freshSsrAnonymousToken;
        }
        return { accessToken: this.ssrToken.anonymousToken!.token.access_token, sessionId: this.ssrToken.anonymousToken!.token.session_id };
    }

    protected createCustomerToken(_tenant: string, _clientId: string, _credentials: { username: string; password: string; }): Promise<{ token: { sessionId: string; saas_token: string; session_id: string; access_token: string; token_type: string; expires_in: number; scope: string; refresh_token?: string; refresh_token_expires_in?: number; }; expiryAt: number; refreshExpiryAt: number | undefined; }> {
        throw new Error("Customer authentication is not allowed, since SSR-Context can't provide Cookies in Response");
    }
    
    protected fetchCustomerToken(_customerToken: StoredToken<EmporixCustomerTokenResponse> | undefined, _tenant: string, _username: string | undefined, password: string | undefined, clientId: string): Promise<StoredToken<EmporixCustomerTokenResponse>> {
        throw new Error("Customer authentication is not allowed, since SSR-Context can't provide Cookies in Response");
    }
    
    protected async writeTokens(tokens: TokenStore): Promise<void> {
        // strip customer Token, since that will be from the the SSR Clients cookie
        tokens.customerToken = undefined;
        this.ssrToken = tokens;
    }

    protected async readTokens(): Promise<TokenStore> {
        const cookieStore = await cookies()
        const tokenCookie: RequestCookie | undefined = cookieStore.get('emporix-token');
        if (!tokenCookie) {
            return {};
        }
        const b64Token = tokenCookie.value;
        const tokens: TokenStore = JSON.parse(Buffer.from(b64Token, 'base64').toString('utf-8'));
        return tokens;
    }

}

export default EmporixTokenManagerSSR;