import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { Locale, NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Open_Sans, Ubuntu } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { routing } from '@/i18n/routing';
import { getSession, setSessionLanguage } from '@/lib/ssr/session';
import { getSite } from '@/lib/ssr/site';
import CustomerSessionProvider from '@/providers/CustomerSessionProvider';
import { StoreProvider } from '@/providers/StoreProvider';
import { StoryblokProvider } from '@/providers/StoryblokProvider';
import '../globals.css';

const defaultSiteCode = process.env.NEXT_PUBLIC_DEFAULT_SITE || 'main';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-open-sans',
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Omit<Props, 'children'>) {
  const { locale } = await props.params;

  const t = await getTranslations({ locale, namespace: 'seo' });

  return {
    title: t('storeName'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const [authSession, shopSession] = await Promise.all([getServerSession(), getSession()]);
  if (shopSession && shopSession.language != locale) {
    // ensure that languages are aligned
    await setSessionLanguage(locale);
    shopSession.language = locale;
  }
  // TODO read from query parameter to allow swtiching
  const site = await getSite(shopSession?.siteCode || defaultSiteCode);
  // Enable static rendering
  setRequestLocale(locale);
  return (
    <html lang={locale} className={`${ubuntu.variable} ${openSans.variable} ${ubuntu.className} ${openSans.className}`}>
      <body className="flex h-full flex-col font-body">
        <CustomerSessionProvider session={authSession}>
          <NextIntlClientProvider locale={locale}>
            <StoreProvider shopSession={shopSession} site={site}>
              <StoryblokProvider>
                {children}
                <Toaster />
              </StoryblokProvider>
            </StoreProvider>
          </NextIntlClientProvider>
        </CustomerSessionProvider>
      </body>
    </html>
  );
}
