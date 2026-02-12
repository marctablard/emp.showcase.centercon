import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import AccountLayout from '@/components/account/account-layout';
import { getMockReturnById } from '@/components/account/returns/mock-returns-data';
import { ReturnDetail } from '@/components/account/returns/return-detail';
import { getReturnById } from '@/lib/ssr/returns';
import { getPageTitle } from '@/lib/ssr/seo';

// Force dynamic rendering for personalized content
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'account.returns' });

  return {
    title: await getPageTitle(t('returnDetails') + ' #' + id, locale),
    description: t('returnDetailsDescription'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ReturnDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  // Get return ID and locale from params
  const { locale, id } = await params;

  // Get translations
  const [tAccount, tReturns, apiReturn] = await Promise.all([
    getTranslations({ locale, namespace: 'account' }),
    getTranslations({ locale, namespace: 'account.returns' }),
    getReturnById(id),
  ]);

  // Use API result or fall back to mock data for UI verification
  const returnItem = apiReturn || getMockReturnById(id);

  // If return not found in both API and mock data, return 404
  if (!returnItem) {
    notFound();
  }

  const breadcrumbs = [
    {
      href: '/account',
      label: tAccount('title'),
    },
    {
      href: '/account/returns',
      label: tReturns('title'),
    },
    {
      href: `/account/returns/${id}`,
      label: `${tReturns('returnLabel')} #${id}`,
    },
  ];

  return (
    <AccountLayout breadcrumbs={breadcrumbs}>
      <ReturnDetail returnId={id} initialReturn={returnItem} />
    </AccountLayout>
  );
}
