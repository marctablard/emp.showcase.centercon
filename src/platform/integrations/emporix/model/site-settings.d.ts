import { Metadata } from './common';
import { EmporixPaymentModeFrontend, EmporixPaymentSiteSetting } from './payment';

export interface EmporixPaymentSiteSetting {
  id: string;
  name: string;
  serviceType: string;
  serviceUrl?: string;
  active: boolean;
  configuration?: Record<string, string>;
}

/**
 * Represents a site in the Emporix system
 */
export interface EmporixSite {
  code: string;
  name?: string;
  active?: boolean;
  default?: boolean;
  defaultLanguage?: string;
  languages?: string[];
  currency?: string;
  availableCurrencies?: string[];
  homeBase?: {
    address?: EmporixAddress;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  paymentModes?: EmporixPaymentSiteSetting[];
  shipToCountries?: string[];
  includesTax?: boolean;
  cartCalculationScale?: number;
  mixins?: Record<string, any>;
  metadata?: Metadata;
}
