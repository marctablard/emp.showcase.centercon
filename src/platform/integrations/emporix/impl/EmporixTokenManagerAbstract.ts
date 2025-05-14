import { StoredToken } from "../../types/auth";
import { AnonymousTokenResponse, CustomerTokenResponse, ServiceAccessTokenResponse } from "../OAuthApi";
import { checkTokenValidity } from "./util/common";
import apis from "../..";
import { OAuthApi } from "../OAuthApi";
import { TokenManager } from "../TokenManager";

export interface TokenStore {
    anonymousToken?: StoredToken<AnonymousTokenResponse>;
    customerToken?: StoredToken<CustomerTokenResponse>;
    serviceToken?: StoredToken<ServiceAccessTokenResponse>;
}

export abstract class EmporixTokenManagerAbstract implements TokenManager {

    async getAnonymousToken(tenant: string, clientId: string): Promise<string> {
        let anonymousToken = await this.readToken<StoredToken<AnonymousTokenResponse>, AnonymousTokenResponse>('anonymous');
        // Check if token is expired or about to expire (within 5 minutes)
        if (!anonymousToken || !checkTokenValidity(anonymousToken.token.access_token, anonymousToken.expiryAt)) {
            const oauthApi = await apis.get<OAuthApi>("EmporixOAuthApi");
            const response = await oauthApi.getAnonymousToken(tenant, clientId);
            const now = Date.now() ;
            anonymousToken = {
                token: response,
                expiryAt: now + (response.expires_in * 1000),
                refreshExpiryAt: response.refresh_token_expires_in ? now + (response.refresh_token_expires_in * 1000) : undefined
            }
            await this.writeToken<StoredToken<AnonymousTokenResponse>, AnonymousTokenResponse>('anonymous', anonymousToken);
        }
        return anonymousToken.token.access_token;
    }

    async getCustomerToken(tenant: string, clientId: string, username?: string, password?: string): Promise<{ accessToken: string, saasToken: string }> {
        let customerToken = await this.readToken<StoredToken<CustomerTokenResponse>, CustomerTokenResponse>('customer');
        // Check if token is expired or about to expire (within 5 minutes)
        if (!customerToken || !checkTokenValidity(customerToken.token.access_token, customerToken.expiryAt)) {
            if (customerToken && checkTokenValidity(customerToken.token.refreshToken, customerToken.refreshExpiryAt)) {
                const oauthApi = await apis.get<OAuthApi>("EmporixOAuthApi");
                const response = await oauthApi.refreshCustomerToken(tenant, customerToken.token.access_token, customerToken.token.refreshToken!)
                customerToken.token = response;
                const now = Date.now();
                customerToken.expiryAt = now + (response.expires_in * 1000);
                customerToken.refreshExpiryAt = response.refreshTokenExpiresIn ? now + (response.refreshTokenExpiresIn * 1000) : undefined;
                await this.writeToken<StoredToken<CustomerTokenResponse>, CustomerTokenResponse>('customer', customerToken);
            } else if (username && password) {
                const oauthApi = await apis.get<OAuthApi>("EmporixOAuthApi");
                // for customer token we need anonymous token first
                const anonymousToken = await this.getAnonymousToken(tenant, clientId);
                const response = await oauthApi.getCustomerToken(tenant, anonymousToken, username, password);
                const now = Date.now();
                customerToken = {
                    token: response,
                    expiryAt: now + (response.expires_in * 1000),
                    refreshExpiryAt: response.refreshTokenExpiresIn ? now + (response.refreshTokenExpiresIn * 1000) : undefined
                }
                await this.writeToken<StoredToken<CustomerTokenResponse>, CustomerTokenResponse>('customer', customerToken);
            } else {
                throw new Error("No CustomerToken available and now Credentials supplied for Re-Authentication")
            }
        }
            
        return {
            accessToken: customerToken.token.access_token,
            saasToken: customerToken.token.saas_token
        };
    }

    async getServiceAccessToken(tenant: string, clientId: string, clientSecret: string): Promise<string> {
        let serviceToken = await this.readToken<StoredToken<ServiceAccessTokenResponse>, ServiceAccessTokenResponse>('service');
        // Check if token is expired or about to expire (within 5 minutes)
        if (!serviceToken || !checkTokenValidity(serviceToken.token.access_token, serviceToken.expiryAt)) {
            const oauthApi = await apis.get<OAuthApi>("EmporixOAuthApi");
            const response = await oauthApi.getServiceAccessToken(tenant, clientId, clientSecret);
            serviceToken = {
                token: response,
                expiryAt: Date.now() + (response.expires_in * 1000)
            }
            await this.writeToken<StoredToken<ServiceAccessTokenResponse>, ServiceAccessTokenResponse>('service', serviceToken);
        }

        return serviceToken.token.access_token;
    }

    abstract clearTokens(): void;

    protected abstract readToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service'): Promise<T | undefined>;
    protected abstract writeToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service', token: T): Promise<void>;
}
