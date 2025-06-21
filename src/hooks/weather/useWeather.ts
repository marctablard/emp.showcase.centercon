'use client';

import { useEffect, useState } from 'react';
import { getWeatherData, useWeatherStore } from '@/lib/client/weather';
import { LocationData } from '@/platform/services/model/common';
import { useLocation } from '../location/useLocation';

export function useWeather() {
  const { weather, loading, error, setWeather, setLoading, setError } = useWeatherStore();
  const { location: userLocation, loading: locationLoading, error: locationError } = useLocation();
  const [weatherLocation, setWeatherLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    // Only fetch weather when we have location data
    if (!weatherLocation || !weatherLocation.geoLocation) return;

    if (weather) {
      setLoading(false);
      return;
    }
    if (loading) {
      return;
    }
    // Fetch real weather data using server action
    const fetchWeatherData = async () => {
      try {
        setLoading(true);

        if (!weatherLocation || !weatherLocation.geoLocation) {
          setError('noLocation');
          return;
        }

        const forecast = await getWeatherData(
          weatherLocation.geoLocation.latitude,
          weatherLocation.geoLocation.longitude,
        );

        setWeather(forecast);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to fetch weather data');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [weather, loading, weatherLocation, userLocation, locationLoading, setError, setWeather, setLoading]);

  useEffect(() => {
    if (!weatherLocation && !locationLoading && !locationError && userLocation !== undefined) {
      if (userLocation) {
        setWeatherLocation(userLocation);
      } else {
        // Default coordinates for fallback (Berlin)
        const defaultLocation: LocationData = {
          city: 'Berlin',
          country: {
            code: 'DE',
            name: 'Germany',
          },
          geoLocation: {
            latitude: 52.52,
            longitude: 13.405,
          },
          state: 'Berlin',
        };
        setWeatherLocation(defaultLocation);
      }
    }
  }, [userLocation, locationLoading, locationError, weatherLocation]);

  const changeLocation = async (location: LocationData): Promise<void> => {
    setWeather(null);
    setWeatherLocation(location);
  };

  return {
    weather,
    loading,
    error,
    changeLocation,
  };
}

export default useWeather;
