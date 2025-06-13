/**
 * Shipping method information
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  zoneId: string;
  cost?: {
    amount: number;
    currency: string;
  };
  taxCode?: string;
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
