import React from 'react';
import { AccountLayout } from '@/components/account/account-layout';

export default function AccountPageLayout({ children }: { children: React.ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>;
}
