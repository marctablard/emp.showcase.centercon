import { Country, Currency, ExchangeRate, Region } from '@/platform/services/model/common';

/**
 * Service for site-related operations including countries, regions, currencies, shipping, and payment
 */
export interface SiteService {
  /**
   * Get all countries
   * @returns List of countries
   */
  getCountries(active?: boolean): Promise<Country[]>;

  /**
   * Get a specific country by code
   * @param countryCode ISO country code
   * @returns Country information or undefined if not found
   */
  getCountry(countryCode: string): Promise<Country | undefined>;

  /**
   * Get all regions
   * @returns List of regions
   */
  getRegions(): Promise<Region[]>;

  /**
   * Get a specific region by code
   * @param regionCode Region code
   * @returns Region information or undefined if not found
   */
  getRegion(regionCode: string): Promise<Region | undefined>;

  /**
   * Get all currencies
   * @returns List of currencies
   */
  getCurrencies(): Promise<Currency[]>;

  /**
   * Get a specific currency by code
   * @param currencyCode Currency code
   * @returns Currency information or undefined if not found
   */
  getCurrency(currencyCode: string): Promise<Currency | undefined>;

  /**
   * Get all exchange rates
   * @returns List of exchange rates
   */
  getExchangeRates(): Promise<ExchangeRate[]>;

  /**
   * Get a specific exchange rate
   * @param sourceCurrency Source currency code
   * @param targetCurrency Target currency code
   * @returns Exchange rate information or undefined if not found
   */
  getExchangeRate(sourceCurrency: string, targetCurrency: string): Promise<ExchangeRate | undefined>;
}
