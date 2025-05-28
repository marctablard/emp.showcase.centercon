/**
 * Price related model definitions for service layer
 */

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
  unitCode: string;
}

/**
 * Price information
 */
export interface Price {
  /**
   * ID of the price
   */
  id: string;
  
  /**
   * Product ID this price is for
   */
  productId: string;
  
  /**
   * Currency of the price
   */
  currency: string;
  
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
   * Tax information
   */
  tax?: {
    /**
     * Tax class (e.g., 'STANDARD')
     */
    taxClass: string;
    
    /**
     * Tax rate percentage
     */
    taxRate: number;
    
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
  };
}

/**
 * Request for matching prices
 */
export interface PriceMatchRequest {
  /**
   * Currency for price matching
   */
  currency: string;
  
  /**
   * Site code for price matching
   */
  siteCode: string;
  
  /**
   * Country code for price matching
   */
  countryCode: string;
  
  /**
   * Items to match prices for
   */
  items: {
    /**
     * Product ID
     */
    productId: string;
    
    /**
     * Quantity information
     */
    quantity: Quantity;
  }[];
}
