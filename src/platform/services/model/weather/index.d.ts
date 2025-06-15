/**
 * Service model for weather data
 */
export interface Weather {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  date: Date;
  description: string; // Localization key
  location: string;
}

export interface WeatherForecast {
  current: Weather;
  hourly: Weather[];
  daily: Weather[];
}
