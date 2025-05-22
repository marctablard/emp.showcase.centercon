import type { AnonymousTokenResponse, CustomerTokenResponse } from '../../oauth/OAuthApi';
import { cookies } from 'next/headers';
import { StoredToken } from '@/platform/integrations/types/auth';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { TokenStore } from './EmporixTokenManagerAbstract';
import { injectable } from '@/platform/core/di/injectable';
import { inject } from 'inversify';
import type { OAuthApi } from '../../oauth/OAuthApi';
import { EmporixTokenManagerAbstract } from './EmporixTokenManagerAbstract';

@injectable('EmporixTokenManager', 'Singleton')
class EmporixTokenManagerSSR extends EmporixTokenManagerAbstract {

    private ssrToken: TokenStore = {};

    constructor(@inject('EmporixOAuthApi') oauthApi: OAuthApi) {
        super(oauthApi);
    }

    public clearTokens(): void {
        this.ssrToken = {};
    }

    public async getAnonymousToken(tenant: string, clientId: string): Promise<string> {
        let anonymousToken = await this.readToken<StoredToken<AnonymousTokenResponse>, AnonymousTokenResponse>('anonymous');
        // if the Token (from Client Cookie) is invalid
        if (this.checkAccessToken(anonymousToken)) {
            return anonymousToken!.token.access_token;
        } else {
            // we use our own token
            if (!this.checkAccessToken(this.ssrToken.anonymousToken)) {
                const freshSsrAnonymousToken = await this.fetchAnonymousToken(this.ssrToken.anonymousToken, tenant, clientId);
                // ...and store it globally, so it can be reused
                this.ssrToken.anonymousToken = freshSsrAnonymousToken;
            }
            return this.ssrToken.anonymousToken!.token.access_token;
        }
    }

    protected fetchCustomerToken(_customerToken: StoredToken<CustomerTokenResponse> | undefined, tenant: string, username: string | undefined, password: string | undefined, clientId: string): Promise<StoredToken<CustomerTokenResponse>> {
        throw new Error("Customer authentication is not allowed");
    }

    protected async writeTokens(tokens: TokenStore): Promise<void> {
        if (tokens.customerToken) {
            throw new Error("SSR Context tried to store CustomerToken, check your application since this is clearly prohibited!")
        }
        this.ssrToken = tokens;
    }

    protected async readTokens(): Promise<TokenStore> {
        const cookieStore = await cookies()
        const tokenCookie : RequestCookie | undefined = cookieStore.get('emporix-token');
        if (!tokenCookie) {
            return  {};
        }
        const b64Token = tokenCookie.value;
        const tokens : TokenStore = JSON.parse(Buffer.from(b64Token, 'base64').toString('utf-8'));
        return tokens;
    }
    
}

export default EmporixTokenManagerSSR;