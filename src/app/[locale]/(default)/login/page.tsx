import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginDialog } from '@/components/login';
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

export default async function LoginPage() {
  return <LoginDialog defaultOpen={true} callbackUrl="/" redirectAfterLogin={true} />;
}
