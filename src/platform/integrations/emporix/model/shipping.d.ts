import { LocalizedString, MonetaryAmount } from './common';

export interface EmporixShippingZone {
  id: string;
  name: LocalizedString;
  shipTo: EmporixShipToLocation[];
  methods: EmporixShippingMethod[];
}

export interface EmporixShipToLocation {
  country: string;
  postalCodes?: string[];
}

export interface EmporixShippingMethod {
  id: string;
  name: LocalizedString;
  maxOrderValue?: number;
  minOrderValue?: number;
  cost?: MonetaryAmount;
  freeShippingThreshold?: MonetaryAmount;
}

export interface EmporixSite {
  id: string;
  zones: EmporixShippingZone[];
}

export interface EmporixSites {
  items: EmporixSite[];
}

export interface EmporixFindSiteRequest {
  postalCode: string;
  country: string;
}
