/**
 * A Stored Token extended by the expiry of a Token
 * @template T The type of the token
 */
export interface StoredToken<T> {
    token: T;
    expiryAt: number;
    refreshExpiryAt?: number;
}
