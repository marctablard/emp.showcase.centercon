import { getLogger } from '@/lib/logger/use-logger-client';
import { ShippingMethod } from '@/platform/services/model/shipping';

/**
 * Get shipping methods for a country and postal code
 * @param countryCode The country code
 * @param postalCode The postal code
 * @returns Array of shipping methods
 */
export async function getShippingMethods(
  countryCode: string,
  postalCode: string,
  orderValue?: { amount: number; currency: string },
): Promise<ShippingMethod[]> {
  try {
    // Build URL with required parameters
    let url = `/api/shipping?countryCode=${encodeURIComponent(countryCode)}&postalCode=${encodeURIComponent(postalCode)}`;

    // Add optional order value parameters if provided
    if (orderValue) {
      url += `&amount=${encodeURIComponent(orderValue.amount)}&currency=${encodeURIComponent(orderValue.currency)}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping methods: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    getLogger().error({ err: error, countryCode, postalCode }, 'Error fetching shipping methods');
    throw error;
  }
}

/**
 * Get a shipping method by ID
 * @param methodId The method ID
 * @param zoneId The zone ID
 * @returns The shipping method if found
 */
export async function getShippingMethod(methodId: string, zoneId: string): Promise<ShippingMethod | undefined> {
  try {
    const response = await fetch(`/api/shipping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ methodId, zoneId }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping method: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    getLogger().error({ err: error, methodId, zoneId }, 'Error fetching shipping method');
    throw error;
  }
}
