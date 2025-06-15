'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CustomerMessage } from '@/hooks/customer/useCustomerMessages';
import { DashboardCard } from './dashboard-card';

interface InboxCardProps {
  messages: CustomerMessage[];
  className?: string;
}

export function InboxCard({ messages, className }: InboxCardProps) {
  const t = useTranslations('Account');

  return (
    <DashboardCard title={t('inbox')} className={className}>
      <div className="items-center justify-between absolute top-4 right-4">
        <Badge variant="secondary">{messages.length}</Badge>
      </div>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noMessages')}</p>
        ) : (
          messages.slice(0, 3).map((message) => (
            <div key={message.id} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium flex items-center">
                    {message.title}
                    {!message.read && <Badge variant="default" className="ml-2 h-1.5 w-1.5 rounded-full p-0" />}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(message.date), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
        {messages.length > 3 && (
          <div className="text-center">
            <Link href="/account/inbox" className="text-xs text-primary hover:underline">
              {t('viewAllMessages')}
            </Link>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

export default InboxCard;
