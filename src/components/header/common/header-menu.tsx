import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { HeaderIconLink } from '@/components/header/common/header-icon-link';
import { cn } from '@/lib/utils';

interface HeaderMenuProps {
  className?: string;
}

export function HeaderMenu({ className }: HeaderMenuProps) {
  const t = useTranslations('layout.header');

  return (
    <div className={cn('flex justify-end items-center', className)}>
      <HeaderIconLink icon={Menu} text={t('menu')} href="/#" />
    </div>
  );
}
