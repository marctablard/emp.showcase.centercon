import { CustomerAddress } from '../customer/customer';

export interface CompanyOnboardingStatus {
  status: 'approved' | 'pending' | 'rejected';
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  onboarding?: CompanyOnboardingStatus;
}

/**
 * Legal information of a company (legal entity).
 */
export interface CompanyLegalInfo {
  legalName?: string;
  registrationDate?: string;
  taxRegistrationNumber?: string;
  registrationAgency?: string;
  countryOfRegistration?: string;
  registrationId?: string;
}

/**
 * Purchasing limit of a company (legal entity account limit).
 */
export interface CompanyAccountLimit {
  currency?: string;
  value?: number;
}

/**
 * Rich, editable representation of a company (Emporix legal entity).
 * Used by the Company Details page.
 */
export interface CompanyDetails extends Company {
  /** Legal entity type — companies may have subsidiaries. */
  type?: 'COMPANY' | 'SUBSIDIARY';
  /** Parent legal entity id when this is a subsidiary. */
  parentId?: string;
  legalInfo?: CompanyLegalInfo;
  accountLimit?: CompanyAccountLimit;
  /** Company registration id from the company registration. */
  companyRegistrationId?: string;
  /** Locations / addresses attached to the legal entity. */
  addresses?: CustomerAddress[];
  /** Optimistic-locking hint for updates. */
  version?: number;
}

/**
 * Fields the storefront admin is allowed to update on a company.
 */
export interface CompanyUpdateDto {
  name?: string;
  legalInfo?: CompanyLegalInfo;
  accountLimit?: CompanyAccountLimit;
}
