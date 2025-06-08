/**
 * Price related model definitions for Emporix API
 */

/**
 * Item identifier for a product or SKU
 */
export interface ItemId {
  /**
   * Type of the item (PRODUCT or SKU)
   */
  itemType: 'PRODUCT' | 'SKU';

  /**
   * ID of the item
   */
  id: string;
}

/**
 * Quantity with unit code
 */
export interface Quantity {
  /**
   * Numeric quantity value
   */
  quantity: number;

  /**
   * Unit code (e.g., 'pc', 'kg', 'g')
   */
  unitCode?: string;
}

/**
 * Location information
 */
export interface Location {
  /**
   * Country code (e.g., 'DE', 'US')
   */
  countryCode: string;
}

/**
 * Item with quantity for price matching
 */
export interface PriceMatchItem {
  /**
   * Item identifier
   */
  itemId: ItemId;

  /**
   * Quantity information
   */
  quantity: Quantity;
}

/**
 * Request for matching prices
 */
export interface MatchPricesRequest {
  /**
   * Target currency for price matching
   */
  targetCurrency: string;

  /**
   * Site code for price matching
   */
  siteCode: string;

  /**
   * Target location for price matching
   */
  targetLocation: Location;

  /**
   * Items to match prices for
   */
  items: PriceMatchItem[];
}

/**
 * Request for matching prices by context
 */
export interface MatchPricesByContextRequest {
  /**
   * Items to match prices for
   */
  items: PriceMatchItem[];
}

/**
 * Tax values for a price
 */
export interface TaxValues {
  /**
   * Net value (without tax)
   */
  netValue: number;

  /**
   * Gross value (with tax)
   */
  grossValue: number;

  /**
   * Tax value
   */
  taxValue: number;
}

/**
 * Tax information for a price
 */
export interface PriceTax {
  /**
   * Tax class (e.g., 'STANDARD')
   */
  taxClass: string;

  /**
   * Tax rate percentage
   */
  taxRate: number;

  /**
   * Price values with tax breakdown
   */
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
  /**
   * Type of tier (BASIC, TIERED, VOLUME)
   */
  tierType: 'BASIC' | 'TIERED' | 'VOLUME';

  /**
   * Tier thresholds
   */
  tiers: {
    /**
     * Minimum quantity for the tier
     */
    minQuantity: Quantity;
  }[];
}

/**
 * Price model information
 */
export interface PriceModel {
  /**
   * ID of the price model
   */
  id: string;

  /**
   * Name of the price model (localized)
   */
  name: {
    [locale: string]: string;
  };

  /**
   * Whether the price includes tax
   */
  includesTax: boolean;

  /**
   * Whether the price includes markup
   */
  includesMarkup: boolean;

  /**
   * Measurement unit for the price
   */
  measurementUnit: Quantity;

  /**
   * Tier definition for the price model
   */
  tierDefinition: TierDefinition;

  /**
   * Metadata for the price model
   */
  metadata: {
    /**
     * Version of the price model
     */
    version: number;

    /**
     * Creation timestamp
     */
    createdAt: string;

    /**
     * Last modification timestamp
     */
    modifiedAt: string;
  };
}

/**
 * Tier value for a price
 */
export interface TierValue {
  /**
   * ID of the tier value
   */
  id: string;

  /**
   * Price value for the tier
   */
  priceValue: number;
}

/**
 * Site information
 */
export interface Site {
  /**
   * Site code
   */
  code: string;
}

/**
 * Matched price response
 */
export interface MatchedPrice {
  /**
   * ID of the price
   */
  priceId: string;

  /**
   * Item identifier
   */
  itemId: ItemId;

  /**
   * Site information
   */
  site: Site;

  /**
   * Currency of the price
   */
  currency: string;

  /**
   * Location information
   */
  location: Location;

  /**
   * Original price value
   */
  originalValue: number;

  /**
   * Effective price value (after discounts)
   */
  effectiveValue: number;

  /**
   * Total price value (quantity * effectiveValue)
   */
  totalValue: number;

  /**
   * Quantity information
   */
  quantity: Quantity;

  /**
   * Whether the price includes tax
   */
  includesTax: boolean;

  /**
   * Price model information
   */
  priceModel: PriceModel;

  /**
   * Tax information
   */
  tax: PriceTax;

  /**
   * Tier values for the price
   */
  tierValues: TierValue[];

  /**
   * Metadata for the price
   */
  metadata: {
    /**
     * Version of the price
     */
    version: string;

    /**
     * Creation timestamp
     */
    createdAt: string;

    /**
     * Last modification timestamp
     */
    modifiedAt: string;
  };
}
