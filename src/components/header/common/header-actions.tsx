'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Gauge, Pin, Search, User, UserCheck } from 'lucide-react';
import { HeaderIconButton } from '@/components/header/common/header-icon-button';
import { HeaderIconLink } from '@/components/header/common/header-icon-link';
import useAuthDialog from '@/hooks/auth/useAuthDialog';
import useAuthentication from '@/hooks/authentication/useAuthentication';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function HeaderActions({ className }: { className?: string }) {
  const t = useTranslations('layout.header');
  const { isAuthenticated, loading } = useAuthentication();
  const { openDialog } = useAuthDialog();
  const [isMounted, setIsMounted] = useState(false);
  const isMediumScreen = useBreakpoint('md');
  const isLargeScreen = useBreakpoint('lg');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR-Fallback: Shows a static version on first render
  if (!isMounted) {
    return (
      <div className={`flex items-center gap-5 text-nowrap ${className}`}>
        <div className="hidden md:block lg:hidden">
          <HeaderIconLink icon={Search} text={t('shortSearch')} href={'/#'} />
        </div>
        <HeaderIconButton icon={User} text={t('signIn')} onClick={() => {}} />
        <div className="hidden md:flex gap-5">
          <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
          <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
        </div>
      </div>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <div className={`flex items-center gap-5 text-nowrap ${className}`}>
      {isMediumScreen && !isLargeScreen && <HeaderIconLink icon={Search} text={t('shortSearch')} href={'/#'} />}

      {isAuthenticated ? (
        <HeaderIconLink icon={UserCheck} text={t('account')} href="/account" />
      ) : (
        <HeaderIconButton icon={User} text={t('signIn')} onClick={() => openDialog('login')} />
      )}

      {isMediumScreen && (
        <div className="flex gap-5">
          <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
          <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
        </div>
      )}
    </div>
  );
}
