import { ReactNode } from 'react';
import Footer from '@/components/footer';
import { FooterLinks, FooterWrapper, LegalFooter } from '@/components/footer/footer';
import { Header } from '@/components/header/header';

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  return (
    <>
      <Header />
      <main className="flex-grow mt-17 md:mt-36 lg:mt-52">{children}</main>
      <FooterWrapper>
        <FooterLinks />
        <Footer />
      </FooterWrapper>
      <LegalFooter />
    </>
  );
}
