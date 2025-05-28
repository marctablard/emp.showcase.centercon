import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyFinancials } from '@/hooks/company/useCompany';
import { useTranslations } from 'next-intl';

interface BudgetProgressProps {
  financials: CompanyFinancials;
  className?: string;
}

export function BudgetProgress({ financials, className }: BudgetProgressProps) {
  const t = useTranslations('Account');
  
  // Calculate percentage of budget used
  const budgetUsedPercentage = Math.min(
    100, 
    Math.round(((financials.budget - financials.remainingBudget) / financials.budget) * 100)
  );
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: financials.currency,
    }).format(amount);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{t('budgetOverview')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('revenue')}</span>
            <span className="text-sm font-medium">{formatCurrency(financials.revenue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('totalBudget')}</span>
            <span className="text-sm font-medium">{formatCurrency(financials.budget)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('remainingBudget')}</span>
            <span className="text-sm font-medium">{formatCurrency(financials.remainingBudget)}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>{t('budgetUsed')}</span>
            <span>{budgetUsedPercentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{ width: `${budgetUsedPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BudgetProgress;
