import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  variant?: 'default' | 'stat' | 'primary';
}

export function DashboardCard({
  title,
  subtitle,
  icon,
  className = '',
  children,
  variant = 'default',
}: DashboardCardProps) {
  return (
    <Card variant={variant} rounded="none" className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-sm font-medium opacity-80 mt-1">{subtitle}</p>}
          {icon && <div className="h-4 w-4 text-muted-foreground absolute top-4 right-4">{icon}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
