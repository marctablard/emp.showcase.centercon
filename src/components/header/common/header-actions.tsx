'use client';

import { useTranslations } from 'next-intl';
import { Gauge, Pin, User } from 'lucide-react';
import HeaderIconLink from '@/components/header/common/header-icon-link';
import { QuickOrderDialog } from '@/components/quick-order';
import { useAuthentication } from '@/hooks/authentication/useAuthentication';

export default function HeaderActions() {
  const t = useTranslations('header');
  const { isAuthenticated, loading } = useAuthentication();
  if (loading) {
    return null;
  }
  return (
    <div className="flex justify-end items-center gap-6">
      {isAuthenticated ? (
        <HeaderIconLink icon={User} text={t('account')} href="/account" />
      ) : (
        <HeaderIconLink icon={User} text={t('signIn')} href="/login" />
      )}
      <QuickOrderDialog trigger={<HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" onClick={() => {}} />} />
      <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
    </div>
  );
}
