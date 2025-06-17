import { ReactNode } from 'react';
import { Locale } from 'next-intl';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function LocaleLayout({ children }: Props) {
  return <div className="flex-grow mt-17 md:mt-36 lg:mt-52">{children}</div>;
}
