'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AccountLayout from '@/components/account/account-layout';
import { QuoteStatusBadge } from '@/components/account/quotes/quote-status-badge';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/hooks/quotes/useQuotes';
import { formatDate } from '@/lib/date-utils';

export default function QuoteDetailPage() {
  const t = useTranslations('account.quotes');
  const params = useParams<{ id: string }>();
  const { quote, loading, error } = useQuote(params.id);

  const formatPrice = (price: number | undefined, currency: string | undefined) => {
    if (price === undefined || currency === undefined) return '-';
    return `${price.toFixed(2)} ${currency}`;
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{quote?.reference || t('title')}</h1>
          <Link href="/account/quotes">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('title')}
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded">{error.message}</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : quote ? (
          <div className="space-y-8">
            {/* Quote header information */}
            <div className="grid md:grid-cols-3 gap-6 bg-white p-6 rounded-md border">
              <div>
                <h3 className="text-sm font-medium text-neutral-500">{t('status')}</h3>
                <div className="mt-2">
                  <QuoteStatusBadge status={quote.status} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500">{t('quotationDate')}</h3>
                <p className="mt-2 text-neutral-900">{formatDate(quote.submittedDate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500">{t('totalAmount')}</h3>
                <p className="mt-2 text-neutral-900 font-semibold">{formatPrice(quote.totalGross, quote.currency)}</p>
              </div>
            </div>

            {/* Quote items */}
            <div className="bg-white p-6 rounded-md border">
              <h2 className="text-lg font-semibold mb-4">
                {t('numberOfProducts')}: {quote.items.length}
              </h2>
              <div className="divide-y">
                {quote.items.map((item, index) => (
                  <div key={index} className="py-4 flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name || item.product.id}</p>
                      <p className="text-sm text-neutral-500">
                        {`${item.quantity.quantity} ${item.quantity.unitCode}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AccountLayout>
  );
}
