import { notFound } from 'next/navigation';
import { Locale, hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { routing } from '@/i18n/routing';
import '../globals.css';
import Header from '@/components/header';
import { StoreProvider } from '@/providers/StoreProvider';
import Searchbar from '@/components/searchbar';
import Footer from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';
import { getServerSession } from "next-auth";
import CustomerSessionProvider from "@/providers/CustomerSessionProvider";
import { StoryblokProvider } from '@/providers/StoryblokProvider';

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
    title: t('world')
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
                <Searchbar />
                <main className="flex-grow">
                  {children}
                </main>
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
