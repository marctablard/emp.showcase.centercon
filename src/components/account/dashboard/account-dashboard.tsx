'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { H3 } from '@/components/ui/h';
import { useCustomer } from '@/hooks/customer/useCustomer';
import { useConfigStore } from '@/lib/client/dashboard';
import { Customer } from '@/platform/services/model/customer/customer';
import AccountLayout from '../account-layout';
import { SupportTicketData, SupportTicketDialog } from './cards/support-ticket-dialog';
import Dashboard from './dashboard';
import DashboardControls from './dashboard-controls';

interface AccountDashboardProps {
  initialCustomer?: Customer | null;
}

export default function AccountDashboard({ initialCustomer }: AccountDashboardProps) {
  const t = useTranslations('account');
  const { setLayouts, getLayouts } = useConfigStore();
  const { customer } = useCustomer(initialCustomer);
  const [isCustomizable, setIsCustomizable] = useState(false);

  const handleTicketSubmit = (data: SupportTicketData) => {
    console.log('Ticket submitted:', data);
    // Hier kann später die API-Integration erfolgen
  };

  if (!customer) {
    return <div className="flex justify-center items-center h-full">{t('loading')}</div>;
  }
  return (
    <AccountLayout>
      <div className="space-y-6 mb-6">
        <div className="relative flex justify-between items-center">
          <H3>
            {t('hello')}{' '}
            <span className="text-primary">{customer?.firstName + ' ' + customer?.lastName || 'Kunde'}</span>
          </H3>
          <div className="flex gap-4">
            <SupportTicketDialog onSubmit={handleTicketSubmit} />
            <DashboardControls
              isCustomizableInitial={isCustomizable}
              onIsCustomizableChanged={() => {
                setIsCustomizable(!isCustomizable);
              }}
            />
          </div>
        </div>
        <Dashboard isCustomizable={isCustomizable} layouts={getLayouts()} layoutChanged={setLayouts} />
      </div>
    </AccountLayout>
  );
}
