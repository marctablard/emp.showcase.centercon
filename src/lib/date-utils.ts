import { getLogger } from '@/lib/logger/use-logger-client';

/**
 * Format a date string to a localized format
 * @param dateString The date string to format
 * @param locale The locale to use for formatting (defaults to 'en')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch (error) {
    getLogger().error({ err: error, dateString, locale }, 'Error formatting date');
    return dateString;
  }
}
