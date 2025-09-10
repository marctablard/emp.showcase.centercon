'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/date-utils';
import { Quote } from '@/platform/services/model/quote';
import { QuoteStatusBadge } from './quote-status-badge';

interface QuotesTableProps {
  quotes: Quote[];
  loading?: boolean;
}

export function QuotesTable({ quotes, loading = false }: QuotesTableProps) {
  const t = useTranslations('account.quotesList');
  const [sortOrder, setSortOrder] = useState<string>('latest');

  // Sort quotes based on the selected order
  const sortedQuotes = [...quotes].sort((a, b) => {
    const dateA = new Date(a.submittedDate);
    const dateB = new Date(b.submittedDate);

    return sortOrder === 'latest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  // Function to format price with currency
  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat('de', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    } catch (error) {
      return `${price.toFixed(2)} ${currency}`;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[340px]">
              <SelectValue placeholder={t('latest')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">{t('latest')}</SelectItem>
              <SelectItem value="oldest">{t('oldest')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">{t('quoteReference')}</TableHead>
              <TableHead className="whitespace-nowrap">{t('status')}</TableHead>
              <TableHead className="whitespace-nowrap">{t('quotationDate')}</TableHead>
              <TableHead className="whitespace-nowrap">{t('requestedBy')}</TableHead>
              <TableHead className="whitespace-nowrap">{t('authorization')}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t('totalAmount')}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t('numberOfProducts')}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {t('noQuotes')}
                </TableCell>
              </TableRow>
            ) : (
              sortedQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.reference || quote.id}</TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell>{formatDate(quote.submittedDate)}</TableCell>
                  <TableCell>{quote.customerName || quote.customerId}</TableCell>
                  <TableCell>{quote.approverName || '-'}</TableCell>
                  <TableCell className="text-right">{formatPrice(quote.totalGross, quote.currency)}</TableCell>
                  <TableCell className="text-right">
                    {quote.items?.length || 0} {t('products')}
                  </TableCell>
                  <TableCell>
                    <Link href={`/account/quotes/${quote.id}`}>
                      <Button variant="secondary" size="small">
                        {t('viewQuote')}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
