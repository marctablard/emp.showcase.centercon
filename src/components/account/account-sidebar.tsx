'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { SidebarGroup } from '@/components/ui/sidebar-group';
import { SidebarNavLink } from '@/components/ui/sidebar-nav-link';
import { useAuthentication } from '@/hooks/authentication/useAuthentication';
import { cn } from '@/lib/utils';

interface SidebarItem {
  href: string;
  title: string;
  icon?: React.ReactNode;
  counter?: number;
  badgeVariant?: 'primary' | 'success';
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  groups?: SidebarGroup[];
}

export function AccountSidebar({ className, items, groups = [], ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const { logout } = useAuthentication();
  const locale = useLocale();

  // Whitelist for available links, prevent 404s, just for the demo
  const validLinks = ['/account', '/account/orders', '/account/addresses', '/account/profile', '/account/settings'];

  const renderSidebarLink = (item: SidebarItem) => {
    if (item.href === '/account/logout') {
      return (
        <SidebarNavLink
          key={item.href}
          href={item.href}
          icon={item.icon}
          text={item.title}
          counter={item.counter}
          badgeVariant={item.badgeVariant}
          isLogout={true}
          onClick={() => logout()}
        />
      );
    }
    // Check if the link is in the whitelist, otherwise use '#' to prevent 404s
    const href = validLinks.includes(item.href) ? item.href : '#';

    // Check if active prop is provided or determine based on path with locale handling
    const isActive = pathname === `/${locale}${item.href}` || pathname === item.href;

    return (
      <SidebarNavLink
        key={item.href}
        href={href}
        icon={item.icon}
        text={item.title}
        counter={item.counter}
        badgeVariant={item.badgeVariant}
        active={isActive}
      />
    );
  };

  return (
    <nav
      className={cn(
        'flex flex-col min-w-[288px] items-start border rounded-2xl h-full overflow-y-auto py-4',
        className,
      )}
      {...props}
    >
      {/* Regular items (no group) */}
      {items.map(renderSidebarLink)}

      {/* Groups */}
      {groups.map((group) => (
        <SidebarGroup key={group.title} title={group.title}>
          {group.items.map(renderSidebarLink)}
        </SidebarGroup>
      ))}
    </nav>
  );
}

export default AccountSidebar;
