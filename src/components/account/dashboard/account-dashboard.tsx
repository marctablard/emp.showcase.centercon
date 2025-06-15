'use client';

import React, { useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useTranslations } from 'next-intl';
import { CheckSquare, HandCoins, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useCompany } from '@/hooks/company/useCompany';
import { useCustomer } from '@/hooks/customer/useCustomer';
import { useMessages } from '@/hooks/messages/useMessages';
import { useDashboardStore } from '@/stores/dashboard-store';
import { ApprovalsCard } from './cards/approvals-card';
import { BudgetProgress } from './cards/budget-progress';
import { InboxCard } from './cards/inbox-card';
// Import card components from the cards folder
import { StatCard } from './cards/stat-card';
import { WeatherCard } from './cards/weather-card';

export default function AccountDashboard() {
  const t = useTranslations('Account');
  const { customer, loading: isCustomerLoading } = useCustomer();
  const { company, loading: isCompanyLoading } = useCompany();
  const { messages, loading: isMessagesLoading } = useMessages();
  const { layout, setLayout } = useDashboardStore();

  const ResponsiveReactGridLayout = WidthProvider(Responsive);

  // For responsive layout
  const [width, setWidth] = useState(0);
  const handleBreakpointChange = (breakpoint: string) => {
    toast.success(`Breakpoint changed to ${breakpoint}`);
  };

  // Update width on window resize
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize(); // Set initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock data for the dashboard
  const orderSummary = { total: 12, inProgress: 3 };
  const pendingApprovals = 5;

  if (isCustomerLoading || isMessagesLoading || isCompanyLoading || !customer || !company) {
    return <div className="flex justify-center items-center h-full">{t('loading')}</div>;
  }

  // Create dashboard items
  const dashboardItems = [
    // Row 1 - Small stat cards (half height)
    <div key="revenue" className="h-full relative">
      <StatCard
        title={t('revenue')}
        value={new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: company.financials.currency,
        }).format(company.financials.revenue)}
        icon={<HandCoins className="h-4 w-4" />}
      />
    </div>,
    <div key="orders" className="h-full relative">
      <StatCard
        title={t('orders')}
        value={orderSummary.total}
        description={t('ordersInProgress', { count: orderSummary.inProgress })}
        icon={<ShoppingBag className="h-4 w-4" />}
      />
    </div>,
    <div key="approvals" className="h-full relative">
      <StatCard
        title={t('approvals')}
        value={pendingApprovals}
        description={t('approvalsDescription')}
        icon={<CheckSquare className="h-4 w-4" />}
      />
    </div>,

    // Row 2 - Larger content cards (double height)
    <div key="budget" className="h-full overflow-auto relative">
      <BudgetProgress financials={company.financials} />
    </div>,
    <div key="inbox" className="h-full overflow-auto relative">
      <InboxCard messages={messages} />
    </div>,
    <div key="weather" className="h-full overflow-auto relative">
      <WeatherCard />
    </div>,
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => useDashboardStore.getState().resetLayout()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600 text-sm"
        >
          {t('resetLayout')}
        </button>
      </div>

      <div className="dashboard-container">
        <ResponsiveReactGridLayout
          className="layout"
          layouts={layout}
          measureBeforeMount={false}
          breakpoints={{ xl: 1200, lg: 1024, md: 768, sm: 320 }}
          cols={{ xl: 4, lg: 3, md: 2, sm: 1 }}
          isDraggable={true}
          isResizable={true}
        >
          {dashboardItems}
        </ResponsiveReactGridLayout>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <ApprovalsCard approvals={company.approvals} className="lg:col-span-3" />
      </div>
    </>
  );
}
