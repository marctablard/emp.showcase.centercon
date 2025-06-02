'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckSquare, DollarSign, RotateCcw, ShoppingBag } from 'lucide-react';
import { ApprovalsCard } from '@/components/account/dashboard/approvals-card';
import { BudgetProgress } from '@/components/account/dashboard/budget-progress';
import { InboxCard } from '@/components/account/dashboard/inbox-card';
import { StatCard } from '@/components/account/dashboard/stat-card';
import { useCompany } from '@/hooks/company/useCompany';
import { useCustomer } from '@/hooks/customer/useCustomer';
import useCustomerMessages from '@/hooks/customer/useCustomerMessages';

export default function AccountDashboard() {
  const t = useTranslations('Account');
  const { customer, loading: isCustomerLoading } = useCustomer();
  const { messages, loading: isMessagesLoading } = useCustomerMessages();
  const { company, orderSummary, returnSummary, pendingApprovals, loading: isCompanyLoading } = useCompany();

  if (isCustomerLoading || isMessagesLoading || isCompanyLoading || !customer || !company) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('revenue')}
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: company.financials.currency,
          }).format(company.financials.revenue)}
          icon={<DollarSign className="h-4 w-4" />}
        />

        <StatCard
          title={t('orders')}
          value={orderSummary.total}
          description={t('ordersInProgress', { count: orderSummary.inProgress })}
          icon={<ShoppingBag className="h-4 w-4" />}
        />

        <StatCard
          title={t('returns')}
          value={returnSummary.total}
          description={t('returnsOpen', { count: returnSummary.open })}
          icon={<RotateCcw className="h-4 w-4" />}
        />

        <StatCard
          title={t('approvals')}
          value={pendingApprovals}
          description={t('approvalsDescription')}
          icon={<CheckSquare className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BudgetProgress financials={company.financials} className="lg:col-span-1" />

        <InboxCard messages={messages} className="lg:col-span-1" />

        <ApprovalsCard approvals={company.approvals} className="lg:col-span-1" />
      </div>
    </>
  );
}
