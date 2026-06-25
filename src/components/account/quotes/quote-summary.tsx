'use client';

import { useTranslations } from 'next-intl';
import {
  AccountSpecTable,
  SpecFullWidthRow,
  SpecRow,
  SpecSection,
} from '@/components/account/shared/account-spec-table';
import UiLink from '@/components/ui/link';
import { getPublicDefaultCurrency } from '@/lib/common/public-default-env';
import { formatDate } from '@/lib/date-utils';
import type { Quote } from '@/platform/services/model/quote';

interface QuoteSummaryProps {
  quote: Quote;
  relatedApprovalId?: string | null;
}

export function QuoteSummary({ quote, relatedApprovalId }: QuoteSummaryProps) {
  const t = useTranslations('account.quoteDetails');
  const tList = useTranslations('account.quotesList');

  const currency = quote.currency || getPublicDefaultCurrency();
  const itemCount = quote.items?.reduce((total, item) => total + (item.quantity.quantity || 0), 0) || 0;
  const fmt = (amount: number) => `${amount.toFixed(2)} ${currency}`;
  const baseTotal = quote.totalNet + quote.totalVat + quote.shippingCost;

  return (
    <AccountSpecTable>
      <SpecSection title={t('details')}>
        <SpecRow
          left={{ label: t('quotationDate'), value: formatDate(quote.submittedDate) }}
          right={{ label: t('requestedBy'), value: quote.customerName || quote.customerId || '-' }}
        />
        <SpecRow
          left={{ label: t('numberOfProducts'), value: itemCount }}
          right={{ label: tList('quoteReference'), value: quote.reference || '-' }}
        />
        {quote.orderId ? (
          <SpecRow
            left={{
              label: t('relatedOrder'),
              value: (
                <UiLink href={`/account/orders/${quote.orderId}`} type="Link" variant="primary" size="m">
                  #{quote.orderId}
                </UiLink>
              ),
            }}
          />
        ) : null}
        {relatedApprovalId ? (
          <SpecRow
            left={{
              label: t('relatedApproval'),
              value: (
                <UiLink href={`/account/approval/${relatedApprovalId}`} type="Link" variant="primary" size="m">
                  #{relatedApprovalId}
                </UiLink>
              ),
            }}
          />
        ) : null}
      </SpecSection>

      <SpecSection title={t('quotedPrice')}>
        <SpecRow
          left={{ label: t('netValue'), value: fmt(quote.totalNet) }}
          right={{ label: t('vat'), value: fmt(quote.totalVat) }}
        />
        <SpecRow
          left={{ label: t('transportCost'), value: fmt(quote.shippingCost) }}
          right={{ label: t('quotedTotal'), value: fmt(baseTotal) }}
        />
        <SpecRow left={{ label: tList('totalAmount'), value: fmt(quote.totalGross) }} />
      </SpecSection>

      <SpecSection title={t('transport')}>
        <SpecRow left={{ label: t('transportCondition'), value: quote.shippingMethod || '-' }} />
        <SpecFullWidthRow label={t('deliveryAddress')}>
          {quote.shippingAddress ? (
            <div className="leading-relaxed">
              {quote.shippingAddress.contactName}
              <br />
              {quote.shippingAddress.street}
              <br />
              {quote.shippingAddress.zipCode} {quote.shippingAddress.city}
              <br />
              {quote.shippingAddress.country}
            </div>
          ) : (
            <span className="text-text-placeholders">-</span>
          )}
        </SpecFullWidthRow>
      </SpecSection>
    </AccountSpecTable>
  );
}
