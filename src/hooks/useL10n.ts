import { useLocale } from 'next-intl';
import { LocalizedString } from '@/platform/services/model/common';

/**
 * Hook for localizing content based on the current locale
 * @returns Functions to handle localized content
 */
export function useL10n(locale?: string) {
  if (!locale) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    locale = useLocale();
  }

  /**
   * Extract the localized value from a LocalizedString or return the string directly
   * @param input The string or LocalizedString to localize
   * @param fallbackLocale Optional fallback locale if the current locale is not available (defaults to 'en')
   * @returns The localized string
   */
  const l10n = (input: string | LocalizedString): string => {
    // If input is a simple string, return it directly
    if (typeof input === 'string') {
      return input;
    }

    // Try to get the value for the current locale
    if (input[locale]) {
      return input[locale];
    }

    // If all else fails, return the first available value or an empty string
    const firstAvailableLocale = Object.keys(input)[0];
    return firstAvailableLocale ? input[firstAvailableLocale] : '';
  };

  return {
    l10n,
  };
}
