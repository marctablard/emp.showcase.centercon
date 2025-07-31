'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
}

export function SidebarGroup({ title, className, children, ...props }: SidebarGroupProps) {
  return (
    <div className={cn('mt-4 w-full', className)} {...props}>
      <h3 className="px-3 mb-2 text-base text-muted-foreground tracking-wider border-b pb-1">{title}</h3>
      <div className="space-y-1 [&>*:last-child]:mb-0">{children}</div>
    </div>
  );
}
