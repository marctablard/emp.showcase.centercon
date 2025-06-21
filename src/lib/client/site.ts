'use client';

import type { Country, Currency, Region } from '@/platform/services/model/common';
import { Site } from '@/platform/services/model/common/site';
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
export async function getSite(id?: string): Promise<Site> {
  const response = await fetch('/api/site/' + (id ? id : ''));

  if (!response.ok) {
    throw new Error(`Failed to fetch site data: ${response.statusText}`);
  }

  return await response.json();
}
