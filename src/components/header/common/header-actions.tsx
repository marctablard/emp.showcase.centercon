'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Gauge, Pin, Search, User, UserCheck } from 'lucide-react';
import { HeaderIconButton } from '@/components/header/common/header-icon-button';
import { HeaderIconLink } from '@/components/header/common/header-icon-link';
import useAuthDialog from '@/hooks/authentication/useAuthDialog';
import useAuthentication from '@/hooks/authentication/useAuthentication';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function HeaderActions({
  className,
  onToggleSearch,
  hideSearchIcon,
}: {
  className?: string;
  onToggleSearch?: () => void;
  hideSearchIcon?: boolean;
}) {
  const t = useTranslations('layout.header');
  const { isAuthenticated, loading } = useAuthentication();
  const { openDialog } = useAuthDialog();
  const [isMounted, setIsMounted] = useState(false);
  const isAboveMediumScreen = useBreakpoint('md'); // TODO: Remove this once the header is fully responsive and replace with useBreakpoint('sm')

  // This code is also mentioned in the React docs: https://react.dev/reference/react/useEffect#displaying-different-content-on-the-server-and-the-client
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // SSR-Fallback: Shows a static version on first render
  if (!isMounted) {
    return (
      <div className={`flex items-center gap-5 text-nowrap ${className}`}>
        <div className="hidden sm:block">
          <HeaderIconLink icon={Search} text={t('shortSearch')} href={'/#'} />
        </div>
        <HeaderIconButton icon={User} text={t('signIn')} onClick={() => {}} />
        <div className="hidden sm:flex gap-5">
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
      {onToggleSearch && !hideSearchIcon && isAboveMediumScreen && (
        <HeaderIconButton icon={Search} text={t('shortSearch')} onClick={onToggleSearch} />
      )}

      {isAuthenticated ? (
        <HeaderIconLink icon={UserCheck} text={t('account')} href="/account" />
      ) : (
        <HeaderIconButton icon={User} text={t('signIn')} onClick={() => openDialog('login')} />
      )}

      {isAboveMediumScreen && (
        <div className="flex gap-5">
          <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
          <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
        </div>
      )}
    </div>
  );
}
