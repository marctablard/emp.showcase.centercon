/**
 * Models for Emporix Currency API
 */

export interface EmporixCurrency {
  code: string;
  name: string | Record<string, string>;
  metadata?: {
    createdAt: string;
    modifiedAt: string;
    version: number;
  };
}

export interface EmporixExchangeRate {
  sourceCurrency: string;
  targetCurrency: string;
  rate: string;
  metadata?: {
    createdAt: string;
    modifiedAt: string;
    version: number;
  };
}
