import { StoredToken } from "@platform/integrations/types/auth";
import type { AnonymousTokenResponse, CustomerTokenResponse, ServiceAccessTokenResponse } from "../../oauth/OAuthApi";
import { checkTokenValidity } from "../util/common";
import type { OAuthApi } from "../../oauth/OAuthApi";
import { TokenManager } from "../TokenManager";
import { inject } from "inversify";

export interface TokenStore {
    anonymousToken?: StoredToken<AnonymousTokenResponse>;
    customerToken?: StoredToken<CustomerTokenResponse>;
    serviceToken?: StoredToken<ServiceAccessTokenResponse>;
}

export abstract class EmporixTokenManagerAbstract implements TokenManager {

    constructor(@inject('EmporixOAuthApi') private oauthApi: OAuthApi) { }

    async getAnonymousToken(tenant: string, clientId: string): Promise<{ accessToken: string, sessionId: string }> {
        let anonymousToken = await this.readToken<StoredToken<AnonymousTokenResponse>, AnonymousTokenResponse>('anonymous');
        // Check if token is expired or about to expire (within 5 minutes)
        if (!this.checkAccessToken(anonymousToken)) {
            anonymousToken = await this.fetchAnonymousToken(anonymousToken, tenant, clientId);
            await this.writeToken<StoredToken<AnonymousTokenResponse>, AnonymousTokenResponse>('anonymous', anonymousToken);
        }
        return { accessToken: anonymousToken!.token.access_token, sessionId: anonymousToken!.token.sessionId };
    }

    protected async fetchAnonymousToken(anonymousToken: StoredToken<AnonymousTokenResponse> | undefined, tenant: string, clientId: string) {
        const now = Date.now();
        let response;
        // Try refresh token
        if (anonymousToken && checkTokenValidity(anonymousToken.token.refresh_token, anonymousToken.refreshExpiryAt)) {
            response = await this.oauthApi.refreshAnonymousToken(tenant, anonymousToken.token.refresh_token!, clientId);
        } else {
            response = await this.oauthApi.getAnonymousToken(tenant, clientId);
        }
        anonymousToken = {
            token: response,
            expiryAt: now + (response.expires_in * 1000),
            refreshExpiryAt: response.refresh_token_expires_in ? now + (response.refresh_token_expires_in * 1000) : undefined
        };
        return anonymousToken;
    }

    public async getCustomerToken(tenant: string, clientId: string, credentials?: { username: string; password: string }): Promise<{ accessToken: string, saasToken: string, sessionId: string }> {
        let customerToken = await this.readToken<StoredToken<CustomerTokenResponse>, CustomerTokenResponse>('customer');
        // Check if token is expired or about to expire (within 5 minutes)
        if (!this.checkAccessToken(customerToken)) {
            customerToken = await this.fetchCustomerToken(customerToken, tenant, credentials?.username, credentials?.password, clientId);
            await this.writeToken<StoredToken<CustomerTokenResponse>, CustomerTokenResponse>('customer', customerToken);
        }
        return {
            accessToken: customerToken!.token.access_token,
            saasToken: customerToken!.token.saas_token,
            sessionId: customerToken!.token.sessionId
        };
    }

    protected async fetchCustomerToken(customerToken: StoredToken<CustomerTokenResponse> | undefined, tenant: string, username: string | undefined, password: string | undefined, clientId: string) {
        let response;
        // try refresh token first
        if (customerToken && checkTokenValidity(customerToken.token.refreshToken, customerToken.refreshExpiryAt)) {
            response = await this.oauthApi.refreshCustomerToken(tenant, customerToken.token.access_token, customerToken.token.refreshToken!);
        } else if (username && password) {
            // for customer token we need anonymous token first
            const anonymousToken = await this.getAnonymousToken(tenant, clientId);
            response = await this.oauthApi.getCustomerToken(tenant, anonymousToken.accessToken, username, password);
        } else {
            throw new Error("No CustomerToken available and now Credentials supplied for Re-Authentication");
        }
        const now = Date.now();
        customerToken = {
            token: response,
            expiryAt: now + (response.expires_in * 1000),
            refreshExpiryAt: response.refreshTokenExpiresIn ? now + (response.refreshTokenExpiresIn * 1000) : undefined
        };
        return customerToken;
    }

    public async getServiceAccessToken(tenant: string, clientId: string, clientSecret: string, scopes?: string[]): Promise<string> {
        let serviceToken = await this.readToken<StoredToken<ServiceAccessTokenResponse>, ServiceAccessTokenResponse>('service');
        // Check if token is expired or about to expire (within 5 minutes)
        if (!this.checkAccessToken(serviceToken)) {
            const response = await this.oauthApi.getServiceAccessToken(tenant, clientId, clientSecret, scopes);
            serviceToken = {
                token: response,
                expiryAt: Date.now() + (response.expires_in * 1000)
            }
            await this.writeToken<StoredToken<ServiceAccessTokenResponse>, ServiceAccessTokenResponse>('service', serviceToken);
        }
        return serviceToken!.token.access_token;
    }

    public abstract clearTokens(): void;

    protected async readToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service'): Promise<T | undefined> {
        const tokens = await this.readTokens();
        switch (type) {
            case 'anonymous':
                return tokens.anonymousToken as T;
            case 'customer':
                return tokens.customerToken as T;
            case 'service':
                return tokens.serviceToken as T;
        }
    }

    protected async writeToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service', token: T): Promise<void> {
        const tokenStore: TokenStore = await this.readTokens();
        switch (type) {
            case 'anonymous':
                tokenStore.anonymousToken = token as StoredToken<AnonymousTokenResponse>;
                break;
            case 'customer':
                tokenStore.customerToken = token as StoredToken<CustomerTokenResponse>;
                break;
            case 'service':
                tokenStore.serviceToken = token as StoredToken<ServiceAccessTokenResponse>;
                break;
        }
        return this.writeTokens(tokenStore);
    }

    protected checkAccessToken(storedToken?: StoredToken<AnonymousTokenResponse | CustomerTokenResponse | ServiceAccessTokenResponse>): boolean {
        if (!storedToken) {
            return false;
        }
        return storedToken.token && checkTokenValidity(storedToken.token.access_token, storedToken.expiryAt);
    }

    protected abstract readTokens(): Promise<TokenStore>;
    protected abstract writeTokens(tokens: TokenStore): Promise<void>;

}
