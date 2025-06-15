'use client';

import { useEffect, useState } from 'react';
import { getWeatherForecast } from '@/lib/server/weather';
import { LocationData } from '@/platform/services/model/common';
import { WeatherForecast } from '@/platform/services/model/weather';
import { useLocation } from '../location/useLocation';

export interface WeatherData {
  location: {
    city: string;
    mainLocation: {
      postalCode: string;
      city: string;
    };
  };
  weather: {
    description: string;
    date: string;
    temperature: number;
    precipitation: number;
    humidity: number;
    wind: number;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { location: userLocation, loading: locationLoading, error: locationError } = useLocation();
  const [weatherLocation, setWeatherLocation] = useState<LocationData | null>(null);

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

        // Map the service data to our UI format
        const currentWeather = forecast.current;

        const weatherData: WeatherData = {
          location: {
            city: weatherLocation.city,
            mainLocation: {
              postalCode: userLocation?.postalCode || '',
              city: weatherLocation.city,
            },
          },
          weather: {
            description: currentWeather.description,
            date: getCurrentDate(),
            temperature: currentWeather.temperature,
            precipitation: currentWeather.precipitation,
            humidity: currentWeather.humidity,
            wind: currentWeather.windSpeed,
          },
          coordinates: weatherLocation.geoLocation,
        };

        setWeatherData(weatherData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to fetch weather data');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [weatherLocation]);

  useEffect(() => {
    if (!weatherLocation && !locationLoading && !locationError && userLocation !== undefined) {
      if (userLocation) {
        setWeatherLocation(userLocation);
      } else {
        setWeatherLocation(defaultLocation);
      }
    }
  }, [userLocation, locationLoading, locationError]);

  // Function to get current date in the format "Day, Month DD, YYYY"
  function getCurrentDate(): string {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

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
