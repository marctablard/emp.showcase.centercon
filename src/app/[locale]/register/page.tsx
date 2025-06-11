import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import RegistrationCard from '@/components/register/registration-card';
import { getPageTitle } from '@/lib/ssr/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'register' });

  return {
    title: await getPageTitle(t('title'), locale),
    description: 'Create a new account',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Register() {
  return (
    <div className="flex flex-col items-center">
      <RegistrationCard />
    </div>
  );
}
