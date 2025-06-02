export interface EmporixAccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}
export interface EmporixRefreshTokenResponse {
    refresh_token?: string;
    refresh_token_expires_in?: number;
}

/**
* Response type for anonymous token requests
*/
export interface EmporixAnonymousTokenResponse extends EmporixAccessTokenResponse, EmporixRefreshTokenResponse {
    session_id: string;
}

/**
 * Response type for customer token requests
 */
export interface EmporixCustomerTokenResponse extends EmporixAnonymousTokenResponse {
    saas_token: string;
}
