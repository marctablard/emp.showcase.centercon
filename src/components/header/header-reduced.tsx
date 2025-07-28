'use client';

import { useTranslations } from 'next-intl';
import { Logo } from '@/components/common/logo/logo';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';

export function HeaderReduced() {
  const t = useTranslations('layout.header');

  return (
    <>
      <div className="fixed top-0 left-0 right-0 pt-4 px-8 z-50 max-w-6xl mx-auto">
        <header className="flex items-center bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl px-6 h-16">
          <div className="flex-grow">
            <Logo width={140} height={16} className="min-w-[140px] min-h-[16px]" title={t('home')} />
          </div>
          <HeaderCartButton showSum={true} />
        </header>
      </div>
    </>
  );
}
