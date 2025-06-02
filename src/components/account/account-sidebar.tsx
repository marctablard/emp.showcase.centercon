'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthentication } from '@/hooks/authentication/useAuthentication';
import { cn } from '@/lib/utils';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon?: React.ReactNode;
  }[];
}

export function AccountSidebar({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const { logout } = useAuthentication();

  return (
    <nav className={cn('flex flex-col space-y-1 min-w-[200px] border-r h-full p-4', className)} {...props}>
      {items.map((item) => {
        const isActive = pathname === item.href;

        if (item.href === '/account/logout') {
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                'justify-start px-4 py-2 text-sm font-medium text-left',
                isActive ? 'bg-muted' : 'hover:bg-muted',
              )}
              onClick={() => logout()}
            >
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center px-4 py-2 text-sm font-medium rounded-md',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default AccountSidebar;
