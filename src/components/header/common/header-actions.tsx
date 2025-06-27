'use client';

import { useTranslations } from 'next-intl';
import { Gauge, Pin, Search, User, UserCheck } from 'lucide-react';
import HeaderIconButton from '@/components/header/common/header-icon-button';
import HeaderIconLink from '@/components/header/common/header-icon-link';
import useAuthentication from '@/hooks/authentication/useAuthentication';
import LoginDialog from '../../login/login-dialog';

export default function HeaderActions({ className }: { className?: string }) {
  const t = useTranslations('header');
  const { isAuthenticated, loading } = useAuthentication();
  if (loading) {
    return null;
  }

  return (
    <div className={`flex items-center gap-5 text-nowrap ${className}`}>
      <div className="hidden md:block lg:hidden">
        <HeaderIconLink icon={Search} text={t('shortSearch')} href={'/#'} />
      </div>

      {isAuthenticated ? (
        <HeaderIconLink icon={UserCheck} text={t('account')} href="/account" />
      ) : (
        <LoginDialog trigger={<HeaderIconButton icon={User} text={t('signIn')} />} />
      )}

      <div className="hidden md:flex gap-5">
        <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
        <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
      </div>
    </div>
  );
}
