import { WeatherForecast } from '@/platform/services/model/weather';

/**
 * Service for weather-related operations
 */
export interface WeatherService {
  /**
   * Get weather forecast for a specific location
   * @param latitude The latitude coordinate
   * @param longitude The longitude coordinate
   * @returns Promise with weather forecast data
   */
  getWeatherForecast(latitude: number, longitude: number): Promise<WeatherForecast>;
}
