'use server';

import { cache } from 'react';
import { WeatherForecast } from '@/platform/services/model/weather';
import { WeatherService } from '@/platform/services/weather/WeatherService';

export const getWeatherForecast = cache(async (latitude: number, longitude: number): Promise<WeatherForecast> => {
  const weatherService = globalThis.EMP.platform.server.get<WeatherService>('WeatherService');
  return weatherService.getWeatherForecast(latitude, longitude);
});
