import React from 'react';
import { LucideIcon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulletPointProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

export function BulletPoint({ icon: Icon = Sun, label, value, className, valueClassName, ...props }: BulletPointProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <Icon className="text-white h-5 w-5 flex-shrink-0" />
      <div className="text-white text-sm">{label}</div>
      <div className={cn('ml-auto text-white font-medium', valueClassName)}>{value}</div>
    </div>
  );
}
