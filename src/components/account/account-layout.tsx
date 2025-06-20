import React from 'react';
import { useTranslations } from 'next-intl';
import { Building2, FileText, ListChecks, LogOut, MapPin, ShoppingBag, User } from 'lucide-react';
import { BreadcrumbContent } from '@/lib/breadcrumb';
import { UiBreadcrumb } from '../ui/molecules/ui-breadcrumb';
import { AccountSidebar } from './account-sidebar';

interface AccountLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbContent[];
}

export function AccountLayout({ children, breadcrumbs }: AccountLayoutProps) {
  const t = useTranslations('Account');

  const sidebarItems = [
    {
      href: '/account',
      title: t('accountDetails'),
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/account/addresses/shipping',
      title: t('shippingAddresses'),
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      href: '/account/addresses/billing',
      title: t('billingAddresses'),
      icon: <MapPin className="h-4 w-4" />,
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
    <>
      {breadcrumbs && <UiBreadcrumb items={breadcrumbs} className="max-w-6xl mx-auto px-4 lg:px-9 md:gap-x-6" />}
      <div className="flex min-h-screen">
        <AccountSidebar items={sidebarItems} />
        <main className="w-full ml-4">{children}</main>
      </div>
    </>
  );
}

export default AccountLayout;
