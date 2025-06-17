import { ReactNode } from 'react';
import { Locale } from 'next-intl';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function LocaleLayout({ children }: Props) {
  return <>{children}</>;
}
