import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { Locale, NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Footer from '@/components/footer';
import Header from '@/components/header';
import Searchbar from '@/components/searchbar';
import { Toaster } from '@/components/ui/sonner';
import { routing } from '@/i18n/routing';
import CustomerSessionProvider from '@/providers/CustomerSessionProvider';
import { StoreProvider } from '@/providers/StoreProvider';
import { StoryblokProvider } from '@/providers/StoryblokProvider';
import '../globals.css';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Omit<Props, 'children'>) {
  const { locale } = await props.params;

  const t = await getTranslations({ locale, namespace: 'hello' });

  return {
    title: t('world'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const session = await getServerSession();
  // Enable static rendering
  setRequestLocale(locale);
  return (
    <html className="h-full" lang={locale}>
      <body className="flex h-full flex-col">
        <CustomerSessionProvider session={session}>
          <NextIntlClientProvider locale={locale}>
            <StoreProvider>
              <StoryblokProvider>
                <Header />
                {/*<Searchbar />*/}
                <main className="flex-grow">{children}</main>
                <Footer />
                <Toaster />
              </StoryblokProvider>
            </StoreProvider>
          </NextIntlClientProvider>
        </CustomerSessionProvider>
      </body>
    </html>
  );
}
