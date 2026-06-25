'use client';

import { useTranslations } from 'next-intl';
import {
  AccountSpecTable,
  SpecFullWidthRow,
  SpecNoteRow,
  SpecRow,
  SpecSection,
} from '@/components/account/shared/account-spec-table';
import { getPublicDefaultCurrency } from '@/lib/common/public-default-env';
import type { Approval } from '@/platform/services/model/approval';

interface ApprovalSummaryProps {
  approval: Approval;
}

export function ApprovalSummary({ approval }: ApprovalSummaryProps) {
  const t = useTranslations('orders.Approval');

  const details = approval.details;
  const items = approval.resource.items || [];
  const currency =
    details?.currency ||
    approval.resource.totalPrice?.currency ||
    approval.resource.subTotalPrice?.currency ||
    getPublicDefaultCurrency();

  const valueOfGoods = items.reduce(
    (sum: number, it: { itemPrice?: { amount?: number } }) => sum + (it?.itemPrice?.amount || 0),
    0,
  );
  const shippingCost = details?.shipping?.amount ?? 0;
  const vat = approval.resource.subtotalAggregate?.taxValue ?? 0;
  const total = approval.resource.totalPrice?.amount ?? valueOfGoods + shippingCost + vat;

  const shippingAddress =
    details?.addresses?.find?.((a: { type?: string }) => a?.type === 'SHIPPING') || details?.addresses?.[0];
  const billingAddress =
    details?.addresses?.find?.((a: { type?: string }) => a?.type === 'BILLING') || details?.addresses?.[1];
  const payment = details?.paymentMethods?.[0];

  const fmt = (amount: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);

  const renderAddress = (addr: {
    firstName?: string;
    lastName?: string;
    name?: string;
    companyName?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    region?: string;
    country?: string;
  }) => (
    <div className="leading-relaxed">
      {addr.firstName || addr.name || addr.companyName} {addr.lastName}
      <br />
      {addr.street} {addr.houseNumber}
      <br />
      {addr.postalCode} {addr.city}
      {addr.region ? `, ${addr.region}` : ''}
      <br />
      {addr.country}
    </div>
  );

  return (
    <AccountSpecTable>
      <SpecSection title={t('orderOverview')}>
        <SpecRow
          left={{ label: t('valueOfGoods'), value: fmt(valueOfGoods) }}
          right={{ label: t('shippingCosts'), value: fmt(shippingCost) }}
        />
        <SpecRow left={{ label: t('vat'), value: fmt(vat) }} right={{ label: t('totalValue'), value: fmt(total) }} />
      </SpecSection>

      <SpecSection title={t('transport')}>
        <SpecRow
          left={{
            label: t('transportCondition'),
            value: details?.shipping?.methodName || details?.shipping?.methodId || t('notProvided'),
          }}
        />
        <SpecFullWidthRow label={t('deliveryAddress')}>
          {shippingAddress ? (
            renderAddress(shippingAddress)
          ) : (
            <span className="text-text-placeholders">{t('notProvided')}</span>
          )}
        </SpecFullWidthRow>
      </SpecSection>

      <SpecSection title={t('payment')}>
        <SpecRow
          left={{
            label: t('paymentMethod'),
            value: payment?.name || payment?.type || t('notProvided'),
          }}
        />
        <SpecFullWidthRow label={t('billingAddress')}>
          {billingAddress ? (
            renderAddress(billingAddress)
          ) : (
            <span className="text-text-placeholders">{t('notProvided')}</span>
          )}
        </SpecFullWidthRow>
      </SpecSection>

      {approval.comment ? <SpecNoteRow title={t('note')}>{approval.comment}</SpecNoteRow> : null}
    </AccountSpecTable>
  );
}
