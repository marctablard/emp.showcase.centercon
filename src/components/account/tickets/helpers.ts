import type { BadgeVariant } from '@/components/ui/badge';
import type { ServiceTicket } from '@/platform/services/model/serviceticket';

/**
 * Format an ISO date string for display in the given locale.
 */
export function formatTicketDate(date: string | undefined, locale: string): string {
  if (!date) {
    return '';
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

/**
 * Map a ticket status to a badge variant. Terminal statuses are shown in a
 * success/neutral tone, active statuses use the information tone.
 */
export function getStatusBadgeVariant(ticket: Pick<ServiceTicket, 'isTerminal' | 'statusId'>): BadgeVariant {
  if (ticket.isTerminal) {
    return 'success';
  }
  switch (ticket.statusId) {
    case 'open':
      return 'information';
    case 'reopened':
      return 'warning';
    default:
      return 'information';
  }
}

/**
 * Whether a priority is elevated enough to warrant a dedicated badge.
 * Lower priorities stay implicit to keep the UI uncluttered.
 */
export function isElevatedPriority(priority: string | undefined): boolean {
  switch ((priority ?? '').toLowerCase()) {
    case 'blocker':
    case 'critical':
    case 'high':
      return true;
    default:
      return false;
  }
}

/**
 * Map a ticket priority / SLA to a badge variant.
 */
export function getPriorityBadgeVariant(priority: string | undefined): BadgeVariant {
  switch ((priority ?? '').toLowerCase()) {
    case 'blocker':
      return 'destructive';
    case 'critical':
      return 'warning';
    case 'high':
      return 'warning';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'muted';
    default:
      return 'secondary';
  }
}
