'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { type ServiceTicketStatusKey, dk } from '@/i18n/dynamic-key';
import type { ServiceTicket } from '@/platform/services/model/serviceticket';
import { getStatusBadgeVariant } from './helpers';

interface TicketStatusBadgeProps {
  ticket: Pick<ServiceTicket, 'statusId' | 'statusName' | 'statusVisibleToCustomer' | 'isTerminal'>;
}

/**
 * Displays the ticket status. When the underlying status is flagged as not
 * visible for the customer (an internal/working state), a neutral generic label
 * is shown instead of the raw status name.
 */
export function TicketStatusBadge({ ticket }: TicketStatusBadgeProps) {
  const t = useTranslations('account.serviceTickets');

  const statusKey = dk<ServiceTicketStatusKey>(`statuses.${ticket.statusId}`);
  const label = !ticket.statusVisibleToCustomer
    ? t('statusFallback')
    : t.has(statusKey)
      ? t(statusKey)
      : ticket.statusName;

  return (
    <Badge variant={getStatusBadgeVariant(ticket)} size="status">
      {label}
    </Badge>
  );
}

export default TicketStatusBadge;
