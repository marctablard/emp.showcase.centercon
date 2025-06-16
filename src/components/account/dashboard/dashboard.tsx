'use client';

import React, { useCallback } from 'react';
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useTranslations } from 'next-intl';
import { isEqual } from 'lodash';
import { useCustomer } from '@/hooks/customer/useCustomer';
import { useConfigStore, useLocalDashboardStore } from '@/lib/client/dashboard';
// Import card components from the cards folder
import { ApprovalsSummaryCard } from './cards/approvals';
import { BudgetProgress, BudgetSummaryCard } from './cards/budget';
import { InboxCard } from './cards/inbox-card';
import { OrderSummaryCard, RecentOrdersCard } from './cards/order-cards';
import { SolarOutputCard } from './cards/solar-output-card';
import { WeatherCard } from './cards/weather-card';

interface DashboardProps {
  isCustomizable: boolean;
}

export default function Dashboard({ isCustomizable }: DashboardProps) {
  const t = useTranslations('Account');
  const { customer, loading: isCustomerLoading } = useCustomer();
  const { layouts, setLayouts } = useConfigStore();
  const state = useLocalDashboardStore();

  const ResponsiveReactGridLayout = WidthProvider(Responsive);

  const onBreakpointChange = (breakpoint: string) => {
    state.currentBreakpoint = breakpoint;
  };

  const onLayoutChange = (layout: Layout[], layouts: Layouts) => {
    if (!isEqual(layouts, layouts)) {
      setLayouts(layouts);
    }
    const currentLayout = state.currentLayout;
    if (!isEqual(layout, currentLayout)) {
      state.currentLayout = layout;
    }
  };

  const renderItems = useCallback(() => {
    state.items = [
      <div key="revenue" className="h-full relative">
        <BudgetSummaryCard />
      </div>,
      <div key="orders" className="h-full relative">
        <OrderSummaryCard />
      </div>,
      <div key="approvals" className="h-full relative">
        <ApprovalsSummaryCard />
      </div>,
      <div key="budget" className="h-full overflow-auto relative">
        <BudgetProgress />
      </div>,
      <div key="inbox" className="h-full overflow-auto relative">
        <InboxCard />
      </div>,
      <div key="weather" className="h-full overflow-auto relative">
        <WeatherCard />
      </div>,
      <div key="solar-output" className="h-full overflow-auto relative">
        <SolarOutputCard />
      </div>,
      <div key="recent-orders" className="h-full overflow-auto relative">
        <RecentOrdersCard />
      </div>,
    ];
  }, [state]);

  renderItems();

  if (isCustomerLoading || !customer) {
    return <div className="flex justify-center items-center h-full">{t('loading')}</div>;
  }
  return (
    <div className="relative">
      <ResponsiveReactGridLayout
        layouts={layouts}
        measureBeforeMount={false}
        onBreakpointChange={onBreakpointChange}
        onLayoutChange={onLayoutChange}
        breakpoints={{ xl: 1200, lg: 1024, md: 640, sm: 320 }}
        cols={{ xl: 4, lg: 3, md: 2, sm: 1 }}
        isDraggable={isCustomizable}
        isResizable={isCustomizable}
      >
        {state.items}
      </ResponsiveReactGridLayout>
    </div>
  );
}
