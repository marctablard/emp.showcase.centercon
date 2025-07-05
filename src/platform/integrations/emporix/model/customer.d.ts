import type { EmporixAddress } from './common';

/**
 * Customer domain model
 */
export interface EmporixCustomer {
  id: string;
  customerNumber: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  company?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  preferredSite?: string;
  accounts?: AccountId[];
  addresses?: EmporixAddress[];
  defaultAddress?: EmporixAddress;
  businessModel?: 'B2B' | 'B2C';
  b2b?: EmporixB2Binfo;
  mixins?: Record<string, any>;
  metadata?: DefaultDtoMetadata;
  lastLogin?: string;
}

export interface EmporixSignupRequest {
  email: string;
  password: string;
  customerDetails?: Omit<EmporixCustomer, 'id' | 'customerNumber'>;
  customerAddress?: EmporixAddress;
}

/**
 * Account identifier
 */
export interface AccountId {
  id: string;
  providerId?: string;
}

/**
 * Address DTO for retrieving an address
 */
export interface EmporixCustomerAddress extends EmporixAddress {
  id: string;
  isDefault?: boolean;
  tags?: string[];
}

export interface EmporixB2Binfo {
  companyRegistrationId?: string;
  legalEntities?: EmporixLegalEntity[];
}

export interface EmporixLegalEntity {
  id: string;
  name: string;
  contactAssignmentId: string;
}

export interface EmporixCustomerSignupDto {
  email: string;
  password: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  contactPhone?: string;
  company?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  preferredSite?: string;
  businessModel?: 'B2B' | 'B2C';
  b2b?: {
    companyRegistrationId?: string;
  };
}
