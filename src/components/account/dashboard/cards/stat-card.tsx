'use client';

import React from 'react';
import { DashboardCard, DashboardCardProps } from './dashboard-card';

export interface StatCardProps extends Omit<DashboardCardProps, 'children'> {
  value: string | number;
  description?: string;
}

export function StatCard({ value, description, className, ...props }: StatCardProps) {
  return (
    <DashboardCard variant="stat" className={`${className} h-full`} {...props}>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </DashboardCard>
  );
}

export default StatCard;
