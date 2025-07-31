import { getTranslations } from 'next-intl/server';
import { PasswordUpdateForm } from '@/components/password/password-update-form';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.Password' });

  return {
    title: await getPageTitle(t('updatePassword'), locale),
    description: t('updatePasswordDescription'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface PageParams {
  locale: string;
  searchParams: { token?: string };
}

export default async function PasswordUpdatePage({ params }: { params: Promise<PageParams> }) {
  const p = await params;
  const t = await getTranslations({ locale: p.locale, namespace: 'auth.Password' });

  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">{t('createNewPassword')}</h1>
      <PasswordUpdateForm />
    </div>
  );
}
