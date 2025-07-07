/**
 * Interface for weather data API
 */
export interface OpenMeteoWeatherData {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  date: Date;
  descriptionCode: number;
  location: string;
}

export interface OpenMeteoWeatherForecast {
  current: OpenMeteoWeatherData;
  hourly: OpenMeteoWeatherData[];
  daily: OpenMeteoWeatherData[];
}
