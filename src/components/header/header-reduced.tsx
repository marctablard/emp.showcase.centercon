'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import HeaderCartButton from './common/header-cart-button';

export function HeaderReduced() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 pt-4 px-8 z-50 max-w-6xl mx-auto">
        <header className="flex bg-white h-18 shadow-xl rounded-2xl border px-6 items-center">
          <Link href="/" className="flex-grow">
            <Image src={'/images/logo.svg'} alt="Logo" width="140" height="16" className="h-16 justify-middle" />
          </Link>
          <HeaderCartButton showSum={true} />
        </header>
      </div>
    </>
  );
}
