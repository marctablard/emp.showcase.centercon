import React from 'react';
import { useTranslations } from 'next-intl';
import { Building2, FileText, ListChecks, LogOut, ShoppingBag, User } from 'lucide-react';
import { AccountSidebar } from './account-sidebar';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const t = useTranslations('Account');

  const sidebarItems = [
    {
      href: '/account',
      title: t('accountDetails'),
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/account/company',
      title: t('company'),
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      href: '/account/orders',
      title: t('ordersAndReturns'),
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      href: '/account/quotes',
      title: t('quotes'),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      href: '/account/shopping-lists',
      title: t('shoppingLists'),
      icon: <ListChecks className="h-4 w-4" />,
    },
    {
      href: '/account/logout',
      title: t('logout'),
      icon: <LogOut className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen">
      <AccountSidebar items={sidebarItems} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default AccountLayout;
