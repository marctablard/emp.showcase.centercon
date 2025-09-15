'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import AccountLayout from '@/components/account/account-layout';
import { QuotesTable } from '@/components/account/quotes/quotes-table';
import useCustomer from '@/hooks/customer/useCustomer';
import { useQuotes } from '@/hooks/quotes/useQuotes';

export default function QuotesPage() {
  const t = useTranslations('account.quotesList');
  const { customer } = useCustomer();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const quotesPerPage = 5;

  // Format the query string to filter quotes by customer ID
  // Using useMemo to stabilize the reference and prevent infinite API calls
  const searchParams = useMemo(() => {
    return customer?.id
      ? {
          query: `customer.customerId:${customer.id}`,
        }
      : undefined;
  }, [customer?.id]); // Only recreate if customer ID changes

  const { quotes, loading, error } = useQuotes(searchParams);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (quotes) {
      const maxPage = Math.ceil(quotes.length / quotesPerPage);
      setCurrentPage((prev) => Math.min(prev + 1, maxPage));
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">{t('title')}</h1>

        {error ? (
          <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded">{error.message}</div>
        ) : (
          <QuotesTable
            quotes={quotes}
            loading={loading}
            currentPage={currentPage}
            quotesPerPage={quotesPerPage}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        )}
      </div>
    </AccountLayout>
  );
}
