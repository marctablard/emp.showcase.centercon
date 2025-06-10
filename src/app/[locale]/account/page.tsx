import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AccountDashboard from '@/components/account/dashboard/account-dashboard';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });

  return {
    title: await getPageTitle(t('title'), locale),
    description: t('accountDashboardDescription'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountPage() {
  const t = await getTranslations('Account');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('welcomeBack', { name: 'Customer' })}</h1>
        <p className="text-muted-foreground">{t('accountDashboardDescription')}</p>
      </div>

      <AccountDashboard />
    </div>
  );
}
