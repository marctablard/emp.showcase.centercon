'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { Link } from '@/i18n/navigation';

export function HeaderReduced() {
  const t = useTranslations('layout.header');

  return (
    <>
      <div className="fixed top-0 left-0 right-0 pt-4 px-8 z-50 max-w-6xl mx-auto">
        <header className="flex items-center bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl px-6 h-16">
          <Link href="/" className="flex-grow" title={t('home')}>
            <Image src={'/images/logo.svg'} alt="Logo" width="140" height="16" className="h-16 justify-middle" />
          </Link>
          <HeaderCartButton showSum={true} />
        </header>
      </div>
    </>
  );
}
