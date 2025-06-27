'use client';

import * as React from 'react';
import Link from 'next/link';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

const sidebarNavLinkVariants = cva(
  'h-11 flex items-center justify-between w-full py-2 px-3 text-base transition-colors mb-2 group',
  {
    variants: {
      variant: {
        default: '',
        active: 'bg-primary-50 border-l-4 border-primary-700',
        primary: 'hover:bg-primary/10 text-primary',
        destructive: 'text-destructive hover:bg-destructive/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface SidebarNavLinkProps extends VariantProps<typeof sidebarNavLinkVariants> {
  href: string;
  icon?: React.ReactNode;
  text: string;
  counter?: number;
  badgeVariant?: 'primary' | 'success';
  active?: boolean;
  onClick?: () => void;
  isLogout?: boolean;
  className?: string;
}

export function SidebarNavLink({
  className,
  variant,
  href,
  icon,
  text,
  counter,
  badgeVariant = 'primary',
  active,
  onClick,
  isLogout,
  ...props
}: SidebarNavLinkProps) {
  const activeVariant = active ? 'active' : variant || 'default';
  const linkClassName = cn(sidebarNavLinkVariants({ variant: activeVariant }), className);
  if (isLogout || onClick) {
    return (
      <button type="button" className={linkClassName} onClick={onClick} {...props}>
        <div className="flex items-center gap-3">
          {icon && <div className="shrink-0">{icon}</div>}
          <span className="group-hover:underline">{text}</span>
        </div>
      </button>
    );
  }

  return (
    <Link href={href} className={linkClassName} {...props}>
      <div className="flex items-center gap-3">
        {icon && <div className="w-6 h-6 shrink-0">{icon}</div>}
        <span className="group-hover:underline">{text}</span>
        {typeof counter === 'number' && (
          <Badge
            variant="outline"
            className={`rounded-full text-[10px] font-bold w-[18px] h-[18px] flex justify-center items-center p-0 ${badgeVariant === 'success' ? 'bg-success-100 border-success-600' : 'bg-primary-50 border-primary'}`}
          >
            {counter}
          </Badge>
        )}
      </div>
    </Link>
  );
}
