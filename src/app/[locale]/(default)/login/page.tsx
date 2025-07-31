import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LoginPageClient from '@/components/auth/login-page-client';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.login' });

  return {
    title: await getPageTitle(t('title'), locale),
    description: 'Sign in to your account',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LoginPage() {
  return (
    <>
      {/* Client component that handles opening the login dialog */}
      <LoginPageClient />
    </>
  );
}
