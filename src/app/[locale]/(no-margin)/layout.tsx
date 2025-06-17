import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  return <>{children}</>;
}
