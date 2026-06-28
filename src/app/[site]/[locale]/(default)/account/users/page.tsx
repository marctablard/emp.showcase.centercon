import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/account-layout';
import { TeamManagement } from '@/components/account/team/team-management';
import { H1 } from '@/components/ui/h';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });

  return {
    title: await getPageTitle(t('Team.title'), locale),
    description: t('Team.description'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tAccount = await getTranslations({ locale, namespace: 'account' });

  const breadcrumbs = [
    { href: '/account', label: tAccount('accountDetails') },
    { href: '/account/users', label: tAccount('Team.title') },
  ];

  return (
    <AccountLayout breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6">
        <H1 variant="h6" className="mb-2">
          {tAccount('Team.title')}
        </H1>
        <TeamManagement />
      </div>
    </AccountLayout>
  );
}
