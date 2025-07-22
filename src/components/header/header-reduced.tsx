'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { Link } from '@/i18n/navigation';

export function HeaderReduced() {
  const t = useTranslations('header');

  return (
    <>
      <div className="fixed top-0 left-0 right-0 pt-4 px-8 z-50 max-w-6xl mx-auto">
        <header className="flex bg-white h-18 shadow-xl rounded-2xl border px-6 items-center">
          <Link href="/" className="flex-grow" aria-label={t('goToHomepage')}>
            <Image src={'/images/logo.svg'} alt="Logo" width="140" height="16" className="h-16 justify-middle" />
          </Link>
          <HeaderCartButton showSum={true} />
        </header>
      </div>
    </>
  );
}
