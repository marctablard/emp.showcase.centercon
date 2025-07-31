import { OpenMeteoWeatherData, OpenMeteoWeatherForecast } from '@/platform/integrations/openmeteo/model/weather';
import { Mapper } from '../Mapper';
import { Weather, WeatherForecast } from './index';

/**
 * Specialized mapper interface for transforming between external weather data sources
 * and the internal Weather domain model.
 *
 * @extends {Mapper<SOURCE_TYPE, WeatherForecast>} - Extends the generic Mapper interface with WeatherForecast as the service type
 */
export interface WeatherMapper extends Mapper<OpenMeteoWeatherForecast, WeatherForecast> {
  /**
   * Maps an external weather data item to a service weather item
   *
   * @param sourceWeatherData - The weather data in source format
   * @returns The weather data in service format
   */
  mapWeatherDataToService(sourceWeatherData: OpenMeteoWeatherData): Weather;

  /**
   * Get a human-readable weather description key from a WMO weather code
   *
   * @param code - The WMO weather code
   * @returns A string key for localization
   */
  getWeatherDescriptionKey(code: number): string;
}
