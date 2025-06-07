/**
 * Shipping method information
 */
export interface ShippingMethod {
  /**
   * Unique identifier for the shipping method
   */
  id: string;
  
  /**
   * Display name for the shipping method
   */
  name: string;
  
  /**
   * Description of the shipping method
   */
  description?: string;
  
  /**
   * Cost of the shipping method
   */
  cost: number;
  
  /**
   * Currency for the shipping cost
   */
  currency: string;
  
  /**
   * Estimated delivery timeframe
   */
  estimatedDelivery?: string;
  
  /**
   * Zone ID this shipping method belongs to
   */
  zoneId: string;
}

/**
 * Shipping zone information
 */
export interface ShippingZone {
  /**
   * Unique identifier for the shipping zone
   */
  id: string;
  
  /**
   * Name of the shipping zone
   */
  name: string;
  
  /**
   * Country code for this zone
   */
  country: string;
  
  /**
   * Postal codes covered by this zone (if applicable)
   */
  postalCodes?: string[];
  
  /**
   * Available shipping methods in this zone
   */
  methods: ShippingMethod[];
}
