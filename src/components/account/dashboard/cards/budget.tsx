import React from 'react';
import { useTranslations } from 'next-intl';
import { HandCoins } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useCompany } from '@/hooks/company/useCompany';
import { formatCurrency } from '@/lib/utils';
import { DashboardCard, DashboardCardProps } from './dashboard-card';
import StatCard from './stat-card';

interface BudgetProgressProps extends Omit<DashboardCardProps, 'children'> {}

export function BudgetSummaryCard({ className, title, ...props }: BudgetProgressProps) {
  const t = useTranslations('Account');
  const { loading, error, company } = useCompany();

  if (loading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!company) {
    return <div>No company data available</div>;
  }

  return (
    <StatCard title={t('revenue')} value={company.financials.revenue || '0'} icon={<HandCoins className="h-4 w-4" />} />
  );
}

export function BudgetProgress({ className, title, ...props }: BudgetProgressProps) {
  const t = useTranslations('Account');
  const { loading, error, company } = useCompany();

  if (loading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!company) {
    return <div>No company data available</div>;
  }

  // Calculate percentage of budget used
  const budgetUsedPercentage = Math.min(
    100,
    Math.round(((company?.financials.budget - company?.financials.remainingBudget) / company?.financials.budget) * 100),
  );

  return (
    <DashboardCard title={title || t('budgetOverview')} className={`${className} h-full`} {...props}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('revenue')}</span>
            <span className="text-sm font-medium">{formatCurrency(company.financials.revenue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('totalBudget')}</span>
            <span className="text-sm font-medium">{formatCurrency(company.financials.budget)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('remainingBudget')}</span>
            <span className="text-sm font-medium">{formatCurrency(company.financials.remainingBudget)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>{t('budgetUsed')}</span>
            <span>{budgetUsedPercentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full bg-primary transition-all duration-300`}
              style={{ width: `${budgetUsedPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

export default BudgetProgress;
