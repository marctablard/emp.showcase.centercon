'use client';

import { useTranslations } from 'next-intl';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { HeaderLogo } from '@/components/header/common/header-logo';

export function HeaderCheckout() {
  const t = useTranslations('layout.header');

  return (
    <>
      <header className="fixed top-0 left-0 right-0 pt-4 px-8 z-50 max-w-6xl mx-auto">
        <div className="flex items-center bg-surface-page/95 backdrop-blur-default shadow-sm rounded-lg px-6 h-16">
          <div className="flex-grow">
            <HeaderLogo width={140} height={16} className="min-w-[140px] min-h-[16px]" title={t('home')} />
          </div>
          <HeaderCartButton showSum={true} />
        </div>
      </header>
    </>
  );
}
