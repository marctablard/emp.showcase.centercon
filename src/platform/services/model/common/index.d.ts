export interface RegionSettings {
    region: string,
    currency: Currency,
    language: string
}
  
export interface Currency {
    id: string;
    symbol: string;
}
  
export interface Tax {
  amount: number;
  currency: string;
  netValue : number;
  grossValue : number;
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
    }[],
    currency: string;
    tax?: Tax & TaxType;
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface SearchParams<T> {
    query?: string;
    page?: number;
    size?: number;
    sort?: string;
    criteria?: Partial<T>;
}


export interface Media {
  url: string;
  altText?: string;
}

export interface LocalizedString {
  [key: string]: string;
}