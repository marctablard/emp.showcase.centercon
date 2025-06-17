import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LoginCard from '@/components/login/login-card';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'login' });

  return {
    title: await getPageTitle(t('title'), locale),
    description: 'Sign in to your account',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Login({ params }: { params: Promise<{ locale: string; callbackUrl: string }> }) {
  const { locale: _locale, callbackUrl } = await params;
  return (
    <div className="flex flex-col items-center">
      <LoginCard callbackUrl={callbackUrl} />
    </div>
  );
}
