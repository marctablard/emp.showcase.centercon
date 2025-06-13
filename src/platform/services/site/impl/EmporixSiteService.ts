import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { EmporixCountryApi } from '@/platform/integrations/emporix/country/EmporixCountryApi';
import type { EmporixCurrencyApi } from '@/platform/integrations/emporix/currency/EmporixCurrencyApi';
import { EmporixCountry, EmporixRegion } from '@/platform/integrations/emporix/model/country';
import { EmporixCurrency, EmporixExchangeRate } from '@/platform/integrations/emporix/model/currency';
import { Country, Currency, ExchangeRate, Region } from '@/platform/services/model/common';
import { SiteService } from '../SiteService';

/**
 * Implementation of SiteService for Emporix platform
 * Combines functionality from Country, Currency, Shipping, and Payment APIs
 */
@injectable('SiteService', 'Singleton')
class EmporixSiteService implements SiteService {
  constructor(
    @inject('EmporixCountryApi') private countryApi: EmporixCountryApi,
    @inject('EmporixCurrencyApi') private currencyApi: EmporixCurrencyApi,
  ) {}

  // Map EmporixCountry to Country
  private mapCountry(emporixCountry: EmporixCountry): Country {
    return {
      code: emporixCountry.code,
      name: typeof emporixCountry.name === 'string' ? emporixCountry.name : Object.values(emporixCountry.name)[0] || '',
      regions: emporixCountry.regions,
    };
  }

  // Map EmporixRegion to Region
  private mapRegion(emporixRegion: EmporixRegion): Region {
    return {
      code: emporixRegion.code,
      name: typeof emporixRegion.name === 'string' ? emporixRegion.name : Object.values(emporixRegion.name)[0] || '',
    };
  }

  // Country methods
  async getCountries(active?: boolean): Promise<Country[]> {
    try {
      const emporixCountries = await this.countryApi.getCountries(active);
      return emporixCountries.map((country) => this.mapCountry(country));
    } catch (error) {
      console.error('Error getting countries:', error);
      return [];
    }
  }

  async getCountry(countryCode: string): Promise<Country | undefined> {
    try {
      const emporixCountry = await this.countryApi.getCountry(countryCode);
      return emporixCountry ? this.mapCountry(emporixCountry) : undefined;
    } catch (error) {
      console.error(`Error getting country ${countryCode}:`, error);
      return undefined;
    }
  }

  async getRegions(): Promise<Region[]> {
    try {
      const emporixRegions = await this.countryApi.getRegions();
      return emporixRegions.map((region) => this.mapRegion(region));
    } catch (error) {
      console.error('Error getting regions:', error);
      return [];
    }
  }

  async getRegion(regionCode: string): Promise<Region | undefined> {
    try {
      const emporixRegion = await this.countryApi.getRegion(regionCode);
      return emporixRegion ? this.mapRegion(emporixRegion) : undefined;
    } catch (error) {
      console.error(`Error getting region ${regionCode}:`, error);
      return undefined;
    }
  }

  // Map EmporixCurrency to Currency
  private mapCurrency(emporixCurrency: EmporixCurrency): Currency {
    return {
      // Map code to id for the existing Currency interface
      id: emporixCurrency.code,
      // EmporixCurrency doesn't have symbol, so use a default
      symbol: '$',
      // Add the enhanced properties
      code: emporixCurrency.code,
      name:
        typeof emporixCurrency.name === 'string' ? emporixCurrency.name : Object.values(emporixCurrency.name)[0] || '',
      // EmporixCurrency doesn't have active, so default to true
      active: true,
    };
  }

  // Map EmporixExchangeRate to ExchangeRate
  private mapExchangeRate(emporixRate: EmporixExchangeRate): ExchangeRate {
    return {
      sourceCurrency: emporixRate.sourceCurrency,
      targetCurrency: emporixRate.targetCurrency,
      rate: parseFloat(emporixRate.rate as unknown as string),
    };
  }

  // Currency methods
  async getCurrencies(): Promise<Currency[]> {
    try {
      const emporixCurrencies = await this.currencyApi.getCurrencies();
      return emporixCurrencies.map((currency) => this.mapCurrency(currency));
    } catch (error) {
      console.error('Error getting currencies:', error);
      return [];
    }
  }

  async getCurrency(currencyCode: string): Promise<Currency | undefined> {
    try {
      const emporixCurrency = await this.currencyApi.getCurrency(currencyCode);
      return emporixCurrency ? this.mapCurrency(emporixCurrency) : undefined;
    } catch (error) {
      console.error(`Error getting currency ${currencyCode}:`, error);
      return undefined;
    }
  }

  async getExchangeRates(): Promise<ExchangeRate[]> {
    try {
      const emporixRates = await this.currencyApi.getExchangeRates();
      return emporixRates.map((rate) => this.mapExchangeRate(rate));
    } catch (error) {
      console.error('Error getting exchange rates:', error);
      return [];
    }
  }

  async getExchangeRate(sourceCurrency: string, targetCurrency: string): Promise<ExchangeRate | undefined> {
    try {
      const emporixRate = await this.currencyApi.getExchangeRate(sourceCurrency, targetCurrency);
      return emporixRate ? this.mapExchangeRate(emporixRate) : undefined;
    } catch (error) {
      console.error(`Error getting exchange rate from ${sourceCurrency} to ${targetCurrency}:`, error);
      return undefined;
    }
  }
}

export default EmporixSiteService;
