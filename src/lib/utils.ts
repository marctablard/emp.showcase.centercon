import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LocalizedString } from '@/platform/services/model/common';

export const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'https://emporix-showcase.com';
const defaultEmptyLocale = 'en';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a currency value with the appropriate currency symbol
 * @param amount The amount to format
 * @param currencyCode The ISO currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Build a canonical URL for a product page
 * @param locale The locale code (e.g., 'en', 'fr')
 * @param id The product ID
 * @returns Canonical URL for the product page
 */
export function buildCanonicalUrl(locale: string, path: string): string {
  return `${baseUrl}/${locale === defaultEmptyLocale ? '' : locale}/${path}`;
}
/**
 * Extract the localized value from a LocalizedString or return the string directly
 * @param input The string or LocalizedString to localize
 * @param fallbackLocale Optional fallback locale if the current locale is not available (defaults to 'en')
 * @returns The localized string
 */
export function l10n(input: string | LocalizedString, locale: string): string {
  // If input is a simple string, return it directly
  if (typeof input === 'string') {
    return input;
  }

  // Try to get the value for the current locale
  if (input[locale]) {
    return input[locale];
  }

  // If all else fails, return the first available value or an empty string
  const firstAvailableLocale = Object.keys(input)[0];
  return firstAvailableLocale ? input[firstAvailableLocale] : '';
}

// TODO fill with correct sizes
export const imageSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
