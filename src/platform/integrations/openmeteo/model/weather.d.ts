/**
 * Interface for weather data API
 */
export interface WeatherData {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  date: Date;
  descriptionCode: number;
  location: string;
}

export interface WeatherForecast {
  current: WeatherData;
  hourly: WeatherData[];
  daily: WeatherData[];
}
