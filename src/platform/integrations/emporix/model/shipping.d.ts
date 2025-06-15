import { EmporixLocalizedString, EmporixMonetaryAmount } from './common';

export interface EmporixShippingZone {
  id: string;
  name: EmporixLocalizedString;
  shipTo: EmporixShipToLocation[];
  methods: EmporixShippingMethod[];
}

export interface EmporixShipToLocation {
  country: string;
  postalCodes?: string[];
}

export interface EmporixShippingFee {
  minOrderValue: EmporixMonetaryAmount;
  cost: EmporixMonetaryAmount;
}

export interface EmporixShippingMethod {
  id: string;
  name: EmporixLocalizedString;
  maxOrderValue?: EmporixMonetaryAmount;
  fees: EmporixShippingFee[];
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
