import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/account-layout';
import PasswordChangeForm from '@/components/account/password/password-change-form';
import { getCurrentCustomer } from '@/lib/ssr/customer';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });

  return {
    title: await getPageTitle(t('passwordChangeTitle'), locale),
    description: t('passwordChangeDescription'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PasswordChangePage() {
  const customer = await getCurrentCustomer();

  return (
    <AccountLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Passwort ändern</h1>
        <p className="text-muted-foreground">Hier können Sie Ihr Passwort ändern.</p>

        <PasswordChangeForm customer={customer || null} />
      </div>
    </AccountLayout>
  );
}
