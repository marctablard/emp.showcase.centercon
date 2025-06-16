import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/account-layout';
import { OrdersList } from '@/components/account/dashboard/cards/order-cards';
import { generateBreadcrumbForProduct } from '@/lib/breadcrumb';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'Account' });

  return {
    title: await getPageTitle(t('ordersAndReturns'), locale),
    description: t('ordersPageDescription'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function OrdersPage() {
  const breadcrumbs = [
    {
      href: '/account',
      label: 'Account',
    },
    {
      href: '/account/orders',
      label: 'Orders',
    },
  ];
  generateBreadcrumbForProduct;
  return (
    <AccountLayout breadcrumbs={breadcrumbs}>
      <OrdersList />
    </AccountLayout>
  );
}
