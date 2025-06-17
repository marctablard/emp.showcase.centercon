import { useTranslations } from 'next-intl';
import { Gauge, Pin, Search, User } from 'lucide-react';
import HeaderIconLink from '@/components/header/common/header-icon-link';
import useAuthentication from '@/hooks/authentication/useAuthentication';

export default function HeaderActions() {
  const t = useTranslations('header');
  const { isAuthenticated, loading } = useAuthentication();

  if (loading) {
    return null;
  }

  return (
    <div className="flex justify-end items-center gap-5 text-nowrap">
      <div className="block lg:hidden">
        <HeaderIconLink icon={Search} text={t('shortSearch')} href={'/#'} />
      </div>

      {isAuthenticated ? (
        <HeaderIconLink icon={User} text={t('account')} href="/account" />
      ) : (
        <HeaderIconLink icon={User} text={t('signIn')} href="/login" />
      )}

      <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
      <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
    </div>
  );
}
