import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/account-layout';
import { ApprovalsList } from '@/components/account/approvals/approvals-list';
import { getApprovals } from '@/lib/ssr/approvals';
import { getPageTitle } from '@/lib/ssr/seo';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Approval' });

  return {
    title: await getPageTitle(t('approvals'), locale),
    description: t('approvalsListDescription'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ApprovalsPage({ params }: { params: Promise<{ locale: string }> }) {
  // Fetch approvals data during SSR
  const { locale } = await params;
  const [tAccount, tApproval, approvals] = await Promise.all([
    getTranslations({ locale, namespace: 'Account' }),
    getTranslations({ locale, namespace: 'Approval' }),
    getApprovals(),
  ]);

  const breadcrumbs = [
    {
      href: '/account',
      label: tAccount('title'),
    },
    {
      href: '/account/approvals',
      label: tApproval('approvals'),
    },
  ];

  return (
    <AccountLayout breadcrumbs={breadcrumbs}>
      <ApprovalsList initialApprovals={approvals} />
    </AccountLayout>
  );
}
