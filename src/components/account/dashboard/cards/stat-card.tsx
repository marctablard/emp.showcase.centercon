'use client';

import React from 'react';
import { DashboardCard } from './dashboard-card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, description, icon, className }: StatCardProps) {
  return (
    <DashboardCard title={title} icon={icon} variant="stat" className={className}>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </DashboardCard>
  );
}

export default StatCard;
