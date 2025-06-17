import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  return <main className="flex-grow mt-17 md:mt-36 lg:mt-52">{children}</main>;
}
