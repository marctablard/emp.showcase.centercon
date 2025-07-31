import { OpenMeteoWeatherForecast } from '../model/weather';

export interface OpenMeteoWeatherApi {
  /**
   * Get weather forecast for a specific location
   * @param latitude The latitude coordinate
   * @param longitude The longitude coordinate
   * @returns Promise with weather forecast data
   */
  getWeatherForecast(latitude: number, longitude: number): Promise<OpenMeteoWeatherForecast>;
}
