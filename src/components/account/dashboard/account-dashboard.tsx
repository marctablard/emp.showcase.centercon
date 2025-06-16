'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCustomer } from '@/hooks/customer/useCustomer';
import { Customer } from '@/platform/services/model/customer/customer';
import AccountLayout from '../account-layout';
import Dashboard from './dashboard';
import DashboardControls from './dashboard-controls';

interface AccountDashboardProps {
  initialCustomer?: Customer | null;
}

export default function AccountDashboard({ initialCustomer }: AccountDashboardProps) {
  const t = useTranslations('Account');
  const { customer, loading: isCustomerLoading } = useCustomer(initialCustomer);
  const [isCustomizable, setIsCustomizable] = useState(false);

  if (isCustomerLoading || !customer) {
    return <div className="flex justify-center items-center h-full">{t('loading')}</div>;
  }
  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('welcomeBack', { name: customer?.firstName + ' ' + customer?.lastName || 'Kunde' })}
          </h1>
          <p className="text-muted-foreground">{t('accountDashboardDescription')}</p>

          <DashboardControls
            className="top-4 right-4 absolute"
            isCustomizableInitial={isCustomizable}
            onIsCustomizableChanged={() => {
              setIsCustomizable(!isCustomizable);
            }}
          />
        </div>
        <Dashboard isCustomizable={isCustomizable} />
      </div>
    </AccountLayout>
  );
}
