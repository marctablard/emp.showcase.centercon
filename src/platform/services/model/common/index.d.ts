export interface RegionSettings {
  region: string;
  currency: Currency;
  language: string;
}

export interface Currency {
  id: string;
  symbol: string;
}

export interface Tax {
  amount: number;
  currency: string;
  netValue: number;
  grossValue: number;
}

export interface TaxType {
  taxCode: string;
  taxRate: number;
}

export interface Price {
  amount: number;
  originalAmount?: number;
  tiers?: {
    amount: number;
    quantity: number;
  }[];
  currency: string;
  tax?: Tax & TaxType;
}

export interface FilterValue {
  id: string;
  name?: string;
  count?: number;
  active: boolean;
}

export interface Filter {
  id: string;
  name?: string;
  values: FilterValue[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchResult<T> extends Paginated<T> {
  availableFilters: Filter[];
}

export interface SearchParams<T> {
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
  criteria?: Partial<T>;
  filters?: Record<string, string | string[]>;
}

export interface LocalizedString {
  [key: string]: string;
}

export interface Address {
  contactName: string;
  companyName?: string;
  street: string;
  streetNumber?: string;
  streetAppendix?: string;
  zipCode: string;
  city: string;
  country: string;
  state?: string;
  contactPhone?: string;
}
export interface Media {
  url: string;
  altText?: string | LocalizedString;
  contentType?: string;
}
