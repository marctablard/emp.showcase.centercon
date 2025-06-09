'use client';

import { useCallback, useState } from 'react';
import { getSite } from '@/lib/client/site';
import { Country, Currency, Region } from '@/platform/services/model/common';

/**
 * Hook for accessing site data like countries, regions, and currencies
 * Uses API routes instead of directly accessing services
 */
export function useSite() {
  const [countries, setCountries] = useState<Country[] | undefined>(undefined);
  const [regions, setRegions] = useState<Region[] | undefined>(undefined);
  const [currencies, setCurrencies] = useState<Currency[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch countries
  const fetchSiteData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSite();
      setCountries(data.countries);
      setRegions(data.regions);
      setCurrencies(data.currencies);
    } catch (error) {
      console.error('Error fetching site data:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch site data'));
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    // Data
    countries,
    regions,
    currencies,
    loading,
    error,

    // Fetch methods
    fetchSiteData,
  };
}
