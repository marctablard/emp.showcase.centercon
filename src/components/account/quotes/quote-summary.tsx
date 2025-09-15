'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ClipboardList, DollarSign, ReceiptText, Truck } from 'lucide-react';
import { SummaryCard, SummaryRow } from '@/components/ui/summary-card';
import { formatDate } from '@/lib/date-utils';
import { Quote } from '@/platform/services/model/quote';

interface QuoteSummaryProps {
  quote: Quote;
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({ quote }) => {
  const t = useTranslations('account.quoteDetails');

  // Get quote data
  const currency = quote.currency || 'EUR';
  const itemCount = quote.items?.reduce((total, item) => total + (item.quantity.quantity || 0), 0) || 0;

  // Format currency values
  const fmt = (amount: number) => `${amount.toFixed(2)} ${currency}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Details Card */}
      <SummaryCard heading={t('details')} icon={<ClipboardList className="h-5 w-5 text-primary" />}>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium">{t('quotationDate')}</div>
            <div className="text-sm">{formatDate(quote.submittedDate)}</div>
          </div>

          <div>
            <div className="text-sm font-medium">{t('requestedBy')}</div>
            <div className="text-sm">{quote.customerName || quote.customerId}</div>
          </div>

          <div>
            <div className="text-sm font-medium">{t('numberOfProducts')}</div>
            <div className="text-sm">{itemCount}</div>
          </div>
        </div>
      </SummaryCard>

      {/* Base Price Card */}
      <SummaryCard heading={t('basePrice')} icon={<DollarSign className="h-5 w-5 text-primary" />}>
        <SummaryRow label={t('netValue')}>{fmt(quote.totalNet)}</SummaryRow>
        <SummaryRow label={t('vat')}>{fmt(quote.totalVat)}</SummaryRow>
        <SummaryRow label={t('deliveryCosts')}>{fmt(quote.shippingCost)}</SummaryRow>
        <SummaryRow label={t('baseTotal')} strong>
          {fmt(quote.totalNet + quote.totalVat + quote.shippingCost)}
        </SummaryRow>
      </SummaryCard>

      {/* Transport Card */}
      <SummaryCard heading={t('transport')} icon={<Truck className="h-5 w-5 text-primary" />}>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium">{t('transportCondition')}</div>
            <div className="text-sm">{quote.shippingMethod}</div>
          </div>

          <div>
            <div className="text-sm font-medium">{t('deliveryAddress')}</div>
            <div className="text-sm">
              {quote.shippingAddress.contactName}
              <br />
              {quote.shippingAddress.street}
              <br />
              {quote.shippingAddress.zipCode} {quote.shippingAddress.city}
              <br />
              {quote.shippingAddress.country}
            </div>
          </div>
        </div>
      </SummaryCard>

      {/* Quoted Price Card */}
      <SummaryCard heading={t('quotedPrice')} icon={<ReceiptText className="h-5 w-5 text-primary" />}>
        <SummaryRow label={t('netValue')}>{fmt(quote.totalNet)}</SummaryRow>
        <SummaryRow label={t('vat')}>{fmt(quote.totalVat)}</SummaryRow>
        <SummaryRow label={t('transportCost')}>{fmt(quote.shippingCost)}</SummaryRow>
        <SummaryRow label={t('quotedTotal')} strong>
          {fmt(quote.totalNet + quote.totalVat + quote.shippingCost)}
        </SummaryRow>
      </SummaryCard>
    </div>
  );
};
