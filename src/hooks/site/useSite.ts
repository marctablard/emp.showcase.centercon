'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSite as apiGetSite } from '@/lib/client/site';
import { Country, Currency, Region } from '@/platform/services/model/common';
import { PaymentMode } from '@/platform/services/model/payment';
import { useSiteStore } from '@/providers/StoreProvider';

/**
 * Hook for accessing site data like countries, regions, and currencies
 */
export function useSite() {
  const { setLoading, getLoading, setSite, getSite, site, loading } = useSiteStore();
  const [countries, setCountries] = useState<Country[] | undefined>(getSite()?.countries);
  const [regions, setRegions] = useState<Region[] | undefined>(getSite()?.regions);
  const [currencies, setCurrencies] = useState<Currency[] | undefined>(getSite()?.currencies);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[] | undefined>(getSite()?.paymentModes);
  const [error, setError] = useState<Error | null>(null);

  const fetchSiteData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetSite();
      setSite(data);
    } catch (error) {
      console.error('Error fetching site data:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch site data'));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSite]);

  useEffect(() => {
    if (site) {
      setCountries(site.countries);
      setRegions(site.regions);
      setCurrencies(site.currencies);
      setPaymentModes(site.paymentModes);
    } else if (site === null) {
      setCountries([]);
      setRegions([]);
      setCurrencies([]);
      setPaymentModes([]);
    } else if (site === undefined && !getLoading()) {
      fetchSiteData();
    }
  }, [site, fetchSiteData, getLoading]);

  return {
    countries,
    regions,
    currencies,
    paymentModes,
    loading,
    error,
    fetchSiteData,
  };
}
