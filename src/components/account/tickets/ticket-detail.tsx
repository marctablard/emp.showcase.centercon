'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, LifeBuoy, RotateCcw, Star, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ToastType, notify } from '@/components/ui/toast-notification';
import { type ServiceTicketPriorityKey, dk } from '@/i18n/dynamic-key';
import { Link, useRouter } from '@/i18n/navigation';
import { reopenServiceTicket, replyToServiceTicket, submitServiceTicketFeedback } from '@/lib/client/servicetickets';
import { cn } from '@/lib/utils';
import type { ServiceTicket } from '@/platform/services/model/serviceticket';
import { formatTicketDate, getPriorityBadgeVariant, isElevatedPriority } from './helpers';
import { SanitizedHtml } from './sanitized-html';
import { TicketStatusBadge } from './ticket-status-badge';

interface TicketDetailProps {
  ticket: ServiceTicket;
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  const t = useTranslations('account.serviceTickets');
  const locale = useLocale();
  const router = useRouter();

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [ratingScore, setRatingScore] = useState(ticket.feedback?.score ?? 0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const canShowFeedback = ticket.isTerminal || ticket.statusId === 'solution_provided';
  const hasFeedback = (ticket.feedback?.score ?? 0) > 0;

  const handleReply = async () => {
    if (reply.trim() === '') {
      return;
    }
    setSending(true);
    try {
      await replyToServiceTicket(ticket.id, reply.trim());
      setReply('');
      notify({ title: t('detail.replySent'), type: ToastType.Success });
      router.refresh();
    } catch (error) {
      notify({
        title: t('detail.replyError'),
        description: error instanceof Error ? error.message : undefined,
        type: ToastType.Error,
      });
    } finally {
      setSending(false);
    }
  };

  const handleReopen = async () => {
    setReopening(true);
    try {
      await reopenServiceTicket(ticket.id);
      notify({ title: t('detail.reopened'), type: ToastType.Success });
      router.refresh();
    } catch (error) {
      notify({
        title: t('detail.reopenError'),
        description: error instanceof Error ? error.message : undefined,
        type: ToastType.Error,
      });
    } finally {
      setReopening(false);
    }
  };

  const handleSubmitFeedback = async (score: number) => {
    setRatingScore(score);
    setSubmittingFeedback(true);
    try {
      await submitServiceTicketFeedback(ticket.id, score);
      notify({ title: t('detail.feedbackThanks'), type: ToastType.Success });
      router.refresh();
    } catch (error) {
      notify({
        title: t('detail.feedbackError'),
        description: error instanceof Error ? error.message : undefined,
        type: ToastType.Error,
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/account/tickets"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-action hover:text-text-action-hover"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('detail.back')}
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border-primary bg-surface-primary p-6 shadow-xs lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            {ticket.typeName && (
              <span className="text-xs font-medium uppercase tracking-wide text-text-on-disabled">
                {ticket.typeName}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold text-text-headings lg:text-3xl">{ticket.subject}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-text-on-disabled">
              <span className="font-mono">#{ticket.id}</span>
              <span aria-hidden>·</span>
              <span>
                {t('detail.created')}: {formatTicketDate(ticket.createdAt, locale)}
              </span>
              {ticket.updatedAt && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {t('updatedAt')}: {formatTicketDate(ticket.updatedAt, locale)}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
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
          </div>
        </div>

        {ticket.isReopenable && (
          <div className="mt-5 border-t border-border-primary pt-5">
            <Button variant="secondary" size="small" onClick={handleReopen} disabled={reopening}>
              {reopening ? <Spinner variant="sm" color="primary" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              {t('detail.reopen')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border-primary bg-surface-primary p-6 shadow-xs lg:p-8">
            <h2 className="mb-6 text-lg font-bold text-text-headings">{t('detail.conversation')}</h2>
            {ticket.messages.length === 0 ? (
              <p className="text-sm text-text-placeholders">{t('detail.noMessages')}</p>
            ) : (
              <ul className="space-y-6">
                {ticket.messages.map((message, index) => {
                  const isCustomer = message.author === 'customer';
                  return (
                    <li key={index} className={cn('flex gap-3', isCustomer && 'flex-row-reverse')}>
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          isCustomer
                            ? 'bg-ticket-accent text-ticket-accent-contrast'
                            : 'bg-surface-secondary text-text-headings',
                        )}
                      >
                        {isCustomer ? <User className="h-4 w-4" /> : <LifeBuoy className="h-4 w-4" />}
                      </span>
                      <div className={cn('flex min-w-0 max-w-[85%] flex-col gap-1', isCustomer && 'items-end')}>
                        <span className="text-xs font-medium text-text-on-disabled">
                          {isCustomer ? t('detail.you') : t('detail.support')}
                          {message.date && <> · {formatTicketDate(message.date, locale)}</>}
                        </span>
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-3 text-sm text-text-body',
                            isCustomer ? 'rounded-tr-sm bg-ticket-accent-soft' : 'rounded-tl-sm bg-surface-secondary',
                          )}
                        >
                          <SanitizedHtml html={message.message} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Reply */}
            {!ticket.isTerminal && (
              <div className="mt-8 border-t border-border-primary pt-6">
                <label htmlFor="ticket-reply" className="mb-2 block text-sm font-medium text-text-headings">
                  {t('detail.replyLabel')}
                </label>
                <Textarea
                  id="ticket-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={t('detail.replyPlaceholder')}
                  maxLength={1000}
                />
                <div className="mt-3 flex justify-end">
                  <Button onClick={handleReply} disabled={sending || reply.trim() === ''}>
                    {sending ? <Spinner variant="sm" color="white" /> : t('detail.send')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: request details + feedback */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border-primary bg-surface-primary p-6 shadow-xs">
            <h2 className="mb-4 text-lg font-bold text-text-headings">{t('detail.requestDetails')}</h2>
            <dl className="divide-y divide-border-primary text-sm">
              {ticket.businessImpact && (
                <div className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-wide text-text-on-disabled">
                    {t('detail.businessImpact')}
                  </dt>
                  <dd className="text-text-headings">{ticket.businessImpact}</dd>
                </div>
              )}
              {ticket.summary && (
                <div className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-wide text-text-on-disabled">{t('detail.description')}</dt>
                  <dd className="whitespace-pre-line text-text-headings">{ticket.summary}</dd>
                </div>
              )}
              {ticket.properties.map((property) => (
                <div key={property.id} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-wide text-text-on-disabled">{property.label}</dt>
                  <dd className="text-text-headings">{property.productName ?? property.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {canShowFeedback && (
            <div className="rounded-xl border border-border-primary bg-surface-primary p-6 shadow-xs">
              <h2 className="mb-2 text-lg font-bold text-text-headings">{t('detail.feedbackTitle')}</h2>
              <p className="mb-3 text-sm text-text-on-disabled">
                {hasFeedback ? t('detail.feedbackGiven') : t('detail.feedbackPrompt')}
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={submittingFeedback}
                    onClick={() => handleSubmitFeedback(value)}
                    aria-label={t('detail.rateStars', { count: value })}
                    className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      className={cn(
                        'h-6 w-6 transition-colors',
                        value <= ratingScore
                          ? 'fill-current text-text-warning'
                          : 'text-border-primary hover:text-text-warning',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketDetail;
