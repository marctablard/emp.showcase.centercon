'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, MoveRight } from 'lucide-react';
import { formatTicketDate } from '@/components/account/tickets/helpers';
import { getPriorityBadgeVariant, isElevatedPriority } from '@/components/account/tickets/helpers';
import { TicketStatusBadge } from '@/components/account/tickets/ticket-status-badge';
import { Badge } from '@/components/ui/badge';
import { CardTitle } from '@/components/ui/card';
import { H4 } from '@/components/ui/h';
import UiLink from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { type ServiceTicketPriorityKey, dk } from '@/i18n/dynamic-key';
import { Link } from '@/i18n/navigation';
import { fetchServiceTickets } from '@/lib/client/servicetickets';
import { getLogger } from '@/lib/logger/use-logger-client';
import { cn } from '@/lib/utils';
import type { ServiceTicket } from '@/platform/services/model/serviceticket';
import type { DashboardCardProps } from './dashboard-card';
import { DashboardCard } from './dashboard-card';

const MAX_PREVIEW_TICKETS = 4;

interface TicketCardProps extends Omit<DashboardCardProps, 'children'> {
  items?: ServiceTicket[];
}

export function TicketCard({ className, title, items: initialItems, ...props }: TicketCardProps) {
  const t = useTranslations('account.serviceTickets');
  const locale = useLocale();
  const [tickets, setTickets] = useState<ServiceTicket[]>(initialItems ?? []);
  const [loading, setLoading] = useState(!initialItems);

  useEffect(() => {
    if (initialItems) {
      return;
    }
    let active = true;
    fetchServiceTickets(locale)
      .then((fetched) => {
        if (active) {
          setTickets(fetched);
        }
      })
      .catch((error) => getLogger().error({ err: error }, 'Failed to load service tickets'))
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [locale, initialItems]);

  const previewTickets = tickets.slice(0, MAX_PREVIEW_TICKETS);

  return (
    <DashboardCard variant="default" className={cn('py-4', className)} {...props}>
      <div className="mb-4 flex items-center justify-between">
        <CardTitle>
          <H4>{title || t('title')}</H4>
        </CardTitle>
        <UiLink type="Link" href="/account/tickets" variant="primary" size="m" iconAfter={<ArrowRight />}>
          {t('viewAll')}
        </UiLink>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner color="primary" variant="md" />
        </div>
      ) : previewTickets.length === 0 ? (
        <p className="py-8 text-center text-text-placeholders">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-primary">
          {previewTickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/account/tickets/${ticket.id}`}
                className="group flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-surface-image-background"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-text-headings">{ticket.subject}</p>
                  <p className="mt-0.5 text-xs text-text-on-disabled">
                    {formatTicketDate(ticket.updatedAt ?? ticket.createdAt, locale)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <TicketStatusBadge ticket={ticket} />
                  {ticket.priority &&
                    isElevatedPriority(ticket.priority) &&
                    (() => {
                      const priorityKey = dk<ServiceTicketPriorityKey>(`priorities.${ticket.priority.toLowerCase()}`);
                      return (
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)} size="status">
                          {t.has(priorityKey) ? t(priorityKey) : ticket.priority}
                        </Badge>
                      );
                    })()}
                  <MoveRight className="h-4 w-4 shrink-0 text-text-on-disabled transition-transform group-hover:translate-x-0.5 group-hover:text-ticket-accent" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

export default TicketCard;
