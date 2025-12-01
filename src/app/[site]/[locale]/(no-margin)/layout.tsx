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
      <main>{children}</main>
      <footer>
        <FooterWrapper>
          <FooterLinks />
          <Footer />
        </FooterWrapper>
        <LegalFooter />
      </footer>
    </>
  );
}
