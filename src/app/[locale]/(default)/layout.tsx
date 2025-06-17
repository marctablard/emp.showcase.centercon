import { ReactNode } from 'react';
import { Locale } from 'next-intl';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  return <div className="mx-auto mt-53">{children}</div>;
}
