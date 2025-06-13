import { useTranslations } from 'next-intl';
import { Gauge, Pin, User } from 'lucide-react';
import HeaderIconLink from '@/components/header/header-icon-link';

export default function HeaderActions() {
  const t = useTranslations('header');

  return (
    <div className="flex justify-end items-center gap-6">
      <HeaderIconLink icon={User} text={t('signIn')} href="/login" />
      <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
      <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
    </div>
  );
}
