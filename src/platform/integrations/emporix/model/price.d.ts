/**
 * Price related model definitions for Emporix API
 */
import { LocalizedString } from '@/platform/services/model/common';
import { Metadata } from './common';

/**
 * Item identifier for a product or SKU
 */
export interface ItemId {
  itemType: 'PRODUCT' | 'SKU';
  id: string;
}

/**
 * Quantity with unit code
 */
export interface Quantity {
  quantity: number;
  unitCode?: string;
}

/**
 * Location information
 */
export interface Location {
  countryCode: string;
}

/**
 * Item with quantity for price matching
 */
export interface PriceMatchItem {
  itemId: ItemId;
  quantity: Quantity;
}

/**
 * Request for matching prices
 */
export interface MatchPricesRequest {
  targetCurrency: string;
  siteCode: string;
  targetLocation: Location;
  items: PriceMatchItem[];
}

/**
 * Request for matching prices by context
 */
export interface MatchPricesByContextRequest {
  items: PriceMatchItem[];
}

/**
 * Tax values for a price
 */
export interface TaxValues {
  netValue: number;
  grossValue: number;
  taxValue: number;
}

/**
 * Tax information for a price
 */
export interface PriceTax {
  taxClass: string;
  taxRate: number;
  prices: {
    originalValue: TaxValues;
    effectiveValue: TaxValues;
    totalValue: TaxValues;
  };
}

/**
 * Tier definition for a price model
 */
export interface TierDefinition {
  tierType: 'BASIC' | 'TIERED' | 'VOLUME';
  tiers: {
    id: string;
    minQuantity: Quantity;
  }[];
}

/**
 * Price model information
 */
export interface PriceModel {
  id: string;
  name: string | LocalizedString;
  includesTax: boolean;
  includesMarkup: boolean;
  measurementUnit: Quantity;
  tierDefinition: TierDefinition;
  metadata: Metadata;
}

/**
 * Tier value for a price
 */
export interface TierValue {
  id: string;
  priceValue: number;
}

/**
 * Site information
 */
export interface Site {
  code: string;
}

/**
 * Matched price response
 */
export interface MatchedPrice {
  priceId: string;
  itemId: ItemId;
  site: Site;
  currency: string;
  location: Location;
  originalValue: number;
  effectiveValue: number;
  totalValue: number;
  quantity: Quantity;
  includesTax: boolean;
  priceModel: PriceModel;
  tax: PriceTax;
  tierValues: TierValue[];
  metadata: Metadata;
}
