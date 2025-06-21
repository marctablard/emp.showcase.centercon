import { getTranslations } from 'next-intl/server';
import { PasswordResetForm } from '@/components/password/password-reset-form';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Password' });

  return {
    title: await getPageTitle(t('resetPassword'), locale),
    description: t('resetPasswordDescription'),
    robots: {
      index: true,
      follow: false,
    },
  };
}

export default async function PasswordResetPage() {
  const t = await getTranslations('Password');

  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">{t('resetPassword')}</h1>
      <PasswordResetForm />
    </div>
  );
}
