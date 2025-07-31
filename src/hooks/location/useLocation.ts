'use client';

import { useCallback, useEffect, useState } from 'react';
import { LocationData } from '@/platform/services/model/common';
import { useAddresses } from '../customer/useAddresses';
import { useSite } from '../site/useSite';

export interface UseLocationResult {
  location: LocationData | null | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get the user's location using browser geolocation API or fallback to GeoIP
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addresses, getDefaultAddress } = useAddresses();
  const { countries } = useSite();

  // Try to get location from customer's shipping address
  const getLocationFromCustomerAddress = useCallback((): LocationData | null => {
    const shippingAddress = getDefaultAddress('SHIPPING');

    if (!shippingAddress) {
      return null;
    }
    const country = countries?.find((country) => country.code === shippingAddress.country) || null;
    // If we have a city and country, use the address data
    if (shippingAddress.city && country) {
      return {
        city: shippingAddress.city,
        country: country,
        geoLocation: shippingAddress.geoLocation,
        state: shippingAddress.state || '',
        postalCode: shippingAddress.zipCode,
        timezone: 'Europe/Berlin', // Default timezone, would need to be determined based on location
      };
    }

    return null;
  }, [countries, getDefaultAddress]);

  const fetchLocationFromBrowser = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async () => {
          try {
            // In a real implementation, this would be a reverse geocoding API call
            // For now, we'll mock the response
            throw new Error('Not implemented');
          } catch (_err) {
            reject(new Error('Failed to reverse geocode coordinates'));
          }
        },
        (err) => {
          reject(new Error(`Geolocation permission denied: ${err.message}`));
        },
        { timeout: 10000, enableHighAccuracy: false },
      );
    });
  }, []);

  const fetchLocationFromGeoIP = useCallback(async (): Promise<LocationData> => {
    try {
      const response = await fetch('/api/location');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as LocationData;
    } catch (err) {
      console.error('Error fetching from GeoIP API:', err);
      throw new Error('Failed to fetch location from GeoIP');
    }
  }, []);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Try to get location from customer's shipping address first
    const locationData = getLocationFromCustomerAddress();
    if (locationData) {
      setLocation(locationData);
      setLoading(false);
      return;
    }
    // If customer address fails, try browser geolocation
    try {
      const locationData = await fetchLocationFromBrowser();
      setLocation(locationData);
    } catch (browserErr) {
      console.log('Browser geolocation failed, falling back to GeoIP:', browserErr);

      // If browser geolocation fails, fall back to GeoIP
      try {
        const locationData = await fetchLocationFromGeoIP();
        setLocation(locationData);
      } catch (geoIPErr) {
        console.error('GeoIP fallback also failed:', geoIPErr);
        setError('Failed to determine your location. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchLocationFromBrowser, fetchLocationFromGeoIP, getLocationFromCustomerAddress]);

  useEffect(() => {
    if (location === undefined && !loading && addresses !== undefined && countries !== undefined) {
      fetchLocation();
    }
  }, [loading, location, addresses, countries, fetchLocation]);

  const refetch = async (): Promise<void> => {
    await fetchLocation();
  };

  return { location, loading, error, refetch };
}

export default useLocation;
