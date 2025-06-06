import React from 'react';
import { getTranslations } from 'next-intl/server';
import AccountDashboard from '@/components/account/dashboard/account-dashboard';
import { getCurrentCustomer } from '@/lib/ssr/customer';

export default async function AccountPage() {
  const t = await getTranslations('Account');
  const customer = await getCurrentCustomer();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('welcomeBack', { name: customer?.firstName + ' ' + customer?.lastName || 'Kunde' })}</h1>
        <p className="text-muted-foreground">{t('accountDashboardDescription')}</p>
      </div>

      <AccountDashboard />
    </div>
  );
}
