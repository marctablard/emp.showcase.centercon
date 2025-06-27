import { ReactNode } from 'react';
import Footer, { FooterWrapper, LegalFooter } from '@/components/footer/footer';
import { HeaderReduced } from '@/components/header/header-reduced';

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  return (
    <>
      <HeaderReduced />
      <main className="flex-grow mt-17 md:mt-36 lg:mt-52">{children}</main>
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
      <LegalFooter />
      <LegalFooter />
    </>
  );
}
