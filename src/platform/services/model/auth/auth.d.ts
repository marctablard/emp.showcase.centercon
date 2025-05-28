import { Customer } from '../customer/customer';
import { Address } from '../common/';

/**
 * Authentication Credentials
 */
export interface Credentials {
    username: string;
    password: string;
}

/**
 * Registration data
 */
export interface Registration {
    credentials: Credentials;
    customer?: Omit<Customer, 'id'>;
    address?: Address;
}

/**
 * Represents a user's session
 */
export interface Session {
    sessionId: string;
    customerId?: string;
    siteCode?: string;
    currency?: string;
    cartId?: string;
    country?: string;
    customer?: Customer;
}

