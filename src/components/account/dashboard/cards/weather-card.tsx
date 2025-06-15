'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Snowflake,
  Sun,
  Wind,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { useWeather } from '@/hooks/weather/useWeather';
import { LocationData } from '@/platform/services/model/common';
import { DashboardCard } from './dashboard-card';

interface WeatherCardProps {
  className?: string;
}

interface WeatherIconProps {
  description: string;
  className?: string;
}

/**
 * Component that renders the appropriate weather icon based on the weather description
 */
const WeatherIcon: React.FC<WeatherIconProps> = ({ description, className = 'h-10 w-10' }) => {
  // Group similar weather conditions
  switch (description) {
    // Clear conditions
    case 'clearSky':
    case 'mainlyClear':
      return <Sun className={className} />;

    // Cloudy conditions
    case 'partlyCloudy':
      return <CloudSun className={className} />;
    case 'overcast':
      return <Cloudy className={className} />;

    // Fog conditions
    case 'fog':
    case 'depositingRimeFog':
      return <CloudFog className={className} />;

    // Drizzle conditions
    case 'lightDrizzle':
    case 'moderateDrizzle':
    case 'denseDrizzle':
    case 'lightFreezingDrizzle':
    case 'denseFreezingDrizzle':
      return <CloudDrizzle className={className} />;

    // Rain conditions
    case 'slightRain':
    case 'moderateRain':
    case 'heavyRain':
    case 'lightFreezingRain':
    case 'heavyFreezingRain':
    case 'slightRainShowers':
    case 'moderateRainShowers':
    case 'violentRainShowers':
      return <CloudRain className={className} />;

    // Snow conditions
    case 'slightSnowFall':
    case 'moderateSnowFall':
    case 'heavySnowFall':
    case 'snowGrains':
    case 'slightSnowShowers':
    case 'heavySnowShowers':
      return <CloudSnow className={className} />;

    // Thunderstorm conditions
    case 'thunderstorm':
    case 'thunderstormWithSlightHail':
    case 'thunderstormWithHeavyHail':
      return <CloudLightning className={className} />;

    // Default/unknown
    default:
      return <Sun className={className} />;
  }
};

export function WeatherCard({ className }: WeatherCardProps) {
  const t = useTranslations('Weather');
  const { weatherData, loading, changeLocation } = useWeather();

  if (loading || !weatherData) {
    return (
      <DashboardCard className={className} variant="primary">
        <div className="flex justify-center items-center h-32">{t('loading')}</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title={t(weatherData.weather.description)}
      subtitle={weatherData.weather.date}
      className={className}
      variant="primary"
    >
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex items-center gap-4">
            <WeatherIcon description={weatherData.weather.description} />
            <div>
              <div className="text-3xl font-bold flex items-start">
                {weatherData.weather.temperature.toFixed(1)}
                <span className="text-lg mt-1">°</span>
              </div>
              <div className="text-sm">{weatherData.location.city}</div>
            </div>
          </div>
          <div className="text-sm md:border-l md:border-primary-600 md:pl-4">
            <div className="flex justify-between py-1">
              <span>{t('precipitation')}:</span>
              <span>{weatherData.weather.precipitation}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>{t('humidity')}:</span>
              <span>{weatherData.weather.humidity}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>{t('wind')}:</span>
              <span>{weatherData.weather.wind.toFixed(1)} km/h</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button
            variant="link"
            className="text-white hover:text-white hover:bg-primary-600 w-full"
            onClick={() => {
              const berlinLocation: LocationData = {
                city: 'Berlin',
                country: { code: 'DE', name: 'Germany' },
                state: 'Berlin',
                geoLocation: { latitude: 52.52, longitude: 13.405 },
              };
              changeLocation(berlinLocation);
            }}
          >
            {t('changeLocation')}
          </Button>
        </div>
      </>
    </DashboardCard>
  );
}

export default WeatherCard;
