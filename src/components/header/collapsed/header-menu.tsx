import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import HeaderIconLink from '@/components/header/common/header-icon-link';

export default function HeaderMenu() {
  const t = useTranslations('header');

  return (
    <div className="flex justify-end items-center gap-6">
      <HeaderIconLink icon={Menu} text={t('menu')} href="/#" />
    </div>
  );
}
