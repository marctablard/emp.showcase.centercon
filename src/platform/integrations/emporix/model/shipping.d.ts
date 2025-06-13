import { EmporixMonetaryAmount, LocalizedString } from './common';

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

export interface EmporixShippingFee {
  minOrderValue: EmporixMonetaryAmount;
  cost: EmporixMonetaryAmount;
}

export interface EmporixShippingMethod {
  id: string;
  name: LocalizedString;
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
