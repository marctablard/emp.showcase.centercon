'use client';

import { useTranslations } from 'next-intl';
import AccountLayout from '@/components/account/account-layout';
import { QuotesTable } from '@/components/account/quotes/quotes-table';
import { useQuotes } from '@/hooks/quotes/useQuotes';

export default function QuotesPage() {
  const t = useTranslations('account.quotesList');
  const { quotes, loading, error } = useQuotes();

  return (
    <AccountLayout>
      <div className="space-y-6">
        <h1 className="text-6xl font-bold">{t('title')}</h1>

        {error ? (
          <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded">{error.message}</div>
        ) : (
          <QuotesTable quotes={quotes} loading={loading} />
        )}
      </div>
    </AccountLayout>
  );
}
