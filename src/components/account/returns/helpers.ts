import { Return } from '@/platform/services/model/return';

export function formatReturnDate(dateString: string | undefined, locale: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatReturnCurrency(value: number | undefined, currency: string | undefined, locale: string): string {
  if (value === undefined || !currency) return '-';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

export function getFirstOrderId(returnItem: Return): string {
  return returnItem.orders[0]?.id || '-';
}

export function getRequestorEmail(returnItem: Return): string {
  return returnItem.requestor?.email || '-';
}
