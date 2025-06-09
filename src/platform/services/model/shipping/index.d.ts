/**
 * Shipping method information
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost: number;
  currency: string;
  estimatedDelivery?: string;
  zoneId: string;
}

/**
 * Shipping zone information
 */
export interface ShippingZone {
  id: string;
  name: string;
  country: string;
  postalCodes?: string[];
  methods: ShippingMethod[];
}
