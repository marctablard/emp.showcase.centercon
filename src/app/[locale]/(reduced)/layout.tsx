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
      <main className="flex-grow mt-28">{children}</main>
      <FooterWrapper>
        <Footer reduced />
      </FooterWrapper>
      <LegalFooter />
    </>
  );
}
