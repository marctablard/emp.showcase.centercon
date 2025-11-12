import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/account-layout';
import PasswordChangeForm from '@/components/account/password/password-change-form';
import { H1 } from '@/components/ui/h';
import { getCurrentCustomer } from '@/lib/ssr/customer';
import { getPageTitle } from '@/lib/ssr/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });

  return {
    title: await getPageTitle(t('Password.title'), locale),
    description: t('Password.description'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PasswordChangePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });

  const customer = await getCurrentCustomer();

  return (
    <AccountLayout>
      <div className="space-y-6">
        <H1 variant="h5">{t('Password.title')}</H1>
        <p className="text-text-placeholders">{t('Password.description')}</p>

        <PasswordChangeForm customer={customer || null} />
      </div>
    </AccountLayout>
  );
}
