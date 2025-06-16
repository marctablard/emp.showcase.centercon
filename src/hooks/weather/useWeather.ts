'use client';

import { useEffect, useState } from 'react';
import { getWeatherForecast } from '@/lib/server/weather';
import { LocationData } from '@/platform/services/model/common';
import { WeatherForecast } from '@/platform/services/model/weather';
import { useLocation } from '../location/useLocation';

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { location: userLocation, loading: locationLoading, error: locationError } = useLocation();
  const [weatherLocation, setWeatherLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    // Only fetch weather when we have location data
    if (!weatherLocation || !weatherLocation.geoLocation) return;

    // Fetch real weather data using server action
    const fetchWeatherData = async () => {
      try {
        setLoading(true);

        if (!weatherLocation || !weatherLocation.geoLocation) {
          setError('noLocation');
          return;
        }

        // Fetch real weather data from our weather service
        const forecast: WeatherForecast = await getWeatherForecast(
          weatherLocation.geoLocation.latitude,
          weatherLocation.geoLocation.longitude,
        );

        setWeatherData(forecast);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to fetch weather data');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [weatherLocation, userLocation, locationLoading]);

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
    setWeatherLocation(location);
  };

  return {
    weatherData,
    loading,
    error,
    changeLocation,
  };
}

export default useWeather;
