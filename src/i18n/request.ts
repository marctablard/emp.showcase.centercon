import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { loadI18nTranslations } from 'next-intl-split/load';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // The relative path to the dictionaries folder
  let messages = (await import(`./translations/${locale}.json`)).default;

  if (process.env.NODE_ENV === 'development') {
    // The provided route should starts from the src folder with the Relative approach.
    messages = loadI18nTranslations('./src/i18n/translations', locale, true);
  }

  return {
    locale,
    messages
  };
});
