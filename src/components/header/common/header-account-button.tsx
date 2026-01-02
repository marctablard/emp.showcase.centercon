'use client';

import { useTranslations } from 'next-intl';
import { User, UserCheck } from 'lucide-react';
import { HeaderIconButton } from '@/components/header/common/header-icon-button';
import { HeaderIconLink } from '@/components/header/common/header-icon-link';
import useAuthDialog from '@/hooks/authentication/useAuthDialog';
import useAuthentication from '@/hooks/authentication/useAuthentication';

export function HeaderAccountButton() {
  const t = useTranslations('layout.header');
  const { isAuthenticated, loading } = useAuthentication();
  const { openDialog } = useAuthDialog();

  if (loading) {
    return (
      <div className="flex flex-col items-center min-w-12 rounded-button p-0.5 animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="w-12 h-4 bg-gray-300 rounded -mt-1"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <HeaderIconLink icon={UserCheck} text={t('account')} href="/account" />;
  }

  return <HeaderIconButton icon={User} text={t('signIn')} onClick={() => openDialog('login')} />;
}
