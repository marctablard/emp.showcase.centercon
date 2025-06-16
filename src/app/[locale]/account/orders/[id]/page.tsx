import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/account-layout';
import { OrderDetail } from '@/components/account/orders/order-detail';
import { getOrderById } from '@/lib/ssr/orders';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'Orders' });

  return {
    title: await getPageTitle(`${t('orderDetails')} #${params.id}`, locale),
    description: t('orderDetails'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Force dynamic rendering for personalized content
export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  // Fetch order data during SSR
  const initialOrder = await getOrderById(params.id);
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
  return (
    <AccountLayout breadcrumbs={breadcrumbs}>
      <OrderDetail orderId={params.id} initialOrder={initialOrder} />
    </AccountLayout>
  );
}
