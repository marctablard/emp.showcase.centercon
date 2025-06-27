import { Address } from '../common';

/**
 * Customer domain model
 * Basic customer information
 */
export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  contactPhone?: string;
  language?: string;
  currency?: string;
}

export interface CustomerAddress extends Address {
  types: AddressType[];
}
