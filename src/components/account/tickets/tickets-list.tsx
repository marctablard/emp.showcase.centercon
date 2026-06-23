'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight, Inbox, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { TablePagination } from '@/components/ui/table-pagination';
import { type ServiceTicketPriorityKey, dk } from '@/i18n/dynamic-key';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { fetchServiceTickets } from '@/lib/client/servicetickets';
import { getLogger } from '@/lib/logger/use-logger-client';
import { cn } from '@/lib/utils';
import type { ServiceTicket, ServiceTicketType } from '@/platform/services/model/serviceticket';
import { CreateTicketDialog } from './create-ticket-dialog';
import { formatTicketDate, getPriorityBadgeVariant, isElevatedPriority } from './helpers';
import { TicketStatusBadge } from './ticket-status-badge';

type StatusFilter = 'all' | 'open' | 'closed';
const TICKETS_PER_PAGE = 6;

interface TicketsListProps {
  initialTickets: ServiceTicket[];
  types: ServiceTicketType[];
}

export function TicketsList({ initialTickets, types }: TicketsListProps) {
  const t = useTranslations('account.serviceTickets');
  const locale = useLocale();
  const router = useRouter();

  const [tickets, setTickets] = useState<ServiceTicket[]>(initialTickets);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const fresh = await fetchServiceTickets(locale);
      setTickets(fresh);
    } catch (error) {
      getLogger().error({ err: error }, 'Failed to refresh service tickets');
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (statusFilter === 'open' && ticket.isTerminal) {
        return false;
      }
      if (statusFilter === 'closed' && !ticket.isTerminal) {
        return false;
      }
      if (normalizedSearch.length === 0) {
        return true;
      }
      return (
        ticket.id.toLowerCase().includes(normalizedSearch) ||
        ticket.subject.toLowerCase().includes(normalizedSearch) ||
        (ticket.typeName ?? '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [tickets, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / TICKETS_PER_PAGE));
  const pageTickets = filteredTickets.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE);

  const statusFilters: StatusFilter[] = ['all', 'open', 'closed'];

  const handleCreated = () => {
    void refresh();
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-primary text-[32px] leading-[36px] font-bold text-text-headings lg:text-[40px] lg:leading-[44px]">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-text-on-disabled">{t('description')}</p>
        </div>
        <CreateTicketDialog types={types} onCreated={handleCreated} />
      </div>

      <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
        <div className="inline-flex gap-1 rounded-md bg-surface-image-background p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={cn(
                'rounded-sm px-4 py-1.5 text-sm font-medium transition-colors',
                statusFilter === filter
                  ? 'bg-ticket-accent text-ticket-accent-contrast shadow-sm'
                  : 'text-text-on-disabled hover:text-text-headings',
              )}
            >
              {t(`filters.${filter}`)}
            </button>
          ))}
        </div>
        <div className="relative w-full min-[768px]:max-w-[320px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchPlaceholder')}
            endIcon={loading ? undefined : Search}
            aria-label={t('searchPlaceholder')}
          />
          {loading && (
            <Spinner
              variant="sm"
              color="primary"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
            />
          )}
        </div>
      </div>

      {pageTickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border-primary bg-surface-primary px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ticket-accent-soft text-ticket-accent">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="text-text-on-disabled">{tickets.length === 0 ? t('empty') : t('noMatches')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border-primary bg-surface-primary shadow-sm">
          <ul className="divide-y divide-border-primary">
            {pageTickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/account/tickets/${ticket.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-image-background"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-text-headings">{ticket.subject}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-on-disabled">
                      <span className="font-mono">#{ticket.id}</span>
                      {ticket.typeName && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{ticket.typeName}</span>
                        </>
                      )}
                      <span aria-hidden>·</span>
                      <span>{formatTicketDate(ticket.updatedAt ?? ticket.createdAt, locale)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex flex-row items-center gap-2">
                      <TicketStatusBadge ticket={ticket} />
                      {ticket.priority &&
                        isElevatedPriority(ticket.priority) &&
                        (() => {
                          const priorityKey = dk<ServiceTicketPriorityKey>(
                            `priorities.${ticket.priority.toLowerCase()}`,
                          );
                          return (
                            <Badge variant={getPriorityBadgeVariant(ticket.priority)} size="status">
                              {t.has(priorityKey) ? t(priorityKey) : ticket.priority}
                            </Badge>
                          );
                        })()}
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-text-on-disabled transition-transform group-hover:translate-x-0.5 group-hover:text-ticket-accent" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {filteredTickets.length > TICKETS_PER_PAGE && (
            <TablePagination
              className="border-t border-border-primary px-5 py-3"
              currentPage={currentPage}
              totalPages={totalPages}
              pageIndicator={t('pageIndicator', { current: currentPage, total: totalPages })}
              previousLabel={t('previous')}
              nextLabel={t('next')}
              onPreviousPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              onNextPage={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TicketsList;
