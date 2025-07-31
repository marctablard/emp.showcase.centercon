import { EmporixCurrency, EmporixExchangeRate } from '../model/currency';

/**
 * Interface for the Emporix Currency API
 */
export interface EmporixCurrencyApi {
  /**
   * Get all currencies
   * @returns Promise with array of currencies
   */
  getCurrencies(): Promise<EmporixCurrency[]>;

  /**
   * Get a specific currency by code
   * @param currencyCode ISO currency code
   * @returns Promise with currency or null if not found
   */
  getCurrency(currencyCode: string): Promise<EmporixCurrency | null>;

  /**
   * Get exchange rates
   * @returns Promise with array of exchange rates
   */
  getExchangeRates(): Promise<EmporixExchangeRate[]>;

  /**
   * Get a specific exchange rate
   * @param sourceCurrency Source currency code
   * @param targetCurrency Target currency code
   * @returns Promise with exchange rate or null if not found
   */
  getExchangeRate(sourceCurrency: string, targetCurrency: string): Promise<EmporixExchangeRate | null>;
}
