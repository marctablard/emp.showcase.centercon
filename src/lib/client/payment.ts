'use client';

import type { PaymentMode } from '@/platform/services/model';

/**
 * Get all payment modes from the API
 * @returns Promise with array of payment modes
 */
export async function getPaymentModes(): Promise<PaymentMode[]> {
  const response = await fetch('/api/payment/modes');

  if (!response.ok) {
    throw new Error(`Failed to fetch payment modes: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get a specific payment mode by ID
 * @param id Payment mode ID
 * @returns Promise with payment mode
 */
export async function getPaymentMode(id: string): Promise<PaymentMode> {
  const response = await fetch(`/api/payment/modes/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch payment mode: ${response.statusText}`);
  }

  return await response.json();
}
