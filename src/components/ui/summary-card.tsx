'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface SummaryCardProps extends React.ComponentProps<typeof Card> {
  heading: React.ReactNode;
  icon?: React.ReactNode;
  contentClassName?: string;
}

export function SummaryCard({ heading, icon, className, contentClassName, children, ...props }: SummaryCardProps) {
  return (
    <Card className={cn('border-none shadow-sm', className)} {...props}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg">{heading}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className={cn('space-y-2', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

interface SummaryRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  valueClassName?: string;
  /** Emphasize the value (e.g., for totals) */
  strong?: boolean;
  /** Render the label as muted text */
  mutedLabel?: boolean;
}

export function SummaryRow({
  label,
  children,
  className,
  valueClassName,
  strong,
  mutedLabel,
  ...props
}: SummaryRowProps) {
  return (
    <div className={cn('flex justify-between text-sm', strong && 'font-bold', className)} {...props}>
      <span className={cn(mutedLabel ? 'text-muted-foreground' : undefined)}>{label}</span>
      <span className={cn(valueClassName)}>{children}</span>
    </div>
  );
}
