'use client';

import type { Country, Currency, Region } from '@/platform/services/model/common';
import type { PaymentMode } from '@/platform/services/model/payment';

export type SiteData = {
  countries: Country[];
  regions: Region[];
  currencies: Currency[];
  paymentModes: PaymentMode[];
};

/**
 * Get all countries from the API
 * @returns Promise with array of countries
 */
export async function getSite(): Promise<SiteData> {
  const response = await fetch('/api/site');

  if (!response.ok) {
    throw new Error(`Failed to fetch site data: ${response.statusText}`);
  }

  return await response.json();
}
