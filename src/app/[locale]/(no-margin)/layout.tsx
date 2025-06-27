import { ReactNode } from 'react';
import Footer from '@/components/footer';
import { FooterLinks, FooterWrapper, LegalFooter } from '@/components/footer/footer';
import Header from '@/components/header';

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  return (
    <>
      <Header />
      {children}
      <FooterWrapper>
        <FooterLinks />
        <Footer />
      </FooterWrapper>
      <LegalFooter />
    </>
  );
}
