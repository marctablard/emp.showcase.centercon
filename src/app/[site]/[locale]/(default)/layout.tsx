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
      <main className="flex-grow mt-17 sm:mt-36 md:mt-52">{children}</main>
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
