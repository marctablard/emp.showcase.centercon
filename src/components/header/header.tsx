'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import HeaderActions from '@/components/header/header-actions';
import HeaderBottomBar from '@/components/header/header-bottom-bar';
import HeaderCartButton from '@/components/header/header-cart-button';
import HeaderMiddleBar from '@/components/header/header-middle-bar';
import HeaderNavigation from '@/components/header/header-navigation';
import HeaderSearch from '@/components/header/header-search';
import HeaderTopBanner from '@/components/header/header-top-banner';
import { Link } from '@/i18n/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 200;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <div className="fixed top-0 left-0 right-0 pt-4 z-50">
      <div
        className={`transition-all duration-200 ease-in-out ${scrolled ? 'opacity-0 overflow-hidden max-h-0' : 'opacity-100 max-h-[200px]'}`}
      >
        <header className="bg-white opacity-95 shadow-xl rounded-2xl px-6 pb-2 mx-9">
          <HeaderTopBanner />
          <HeaderMiddleBar />
          <HeaderBottomBar />
        </header>
      </div>

      <div
        className={`transition-all duration-200 ease-in-out ${
          scrolled ? 'opacity-100 max-h-[100px]' : 'opacity-0 overflow-hidden max-h-0'
        }`}
      >
        <header className="flex justify-between bg-white opacity-95 shadow-lg rounded-2xl px-6 py-2 mx-9">
          <div className="flex gap-8 items-center">
            <Link href="/">
              <Image src="/logo_small.svg" alt="Logo" width="25" height="22" />
            </Link>
            <HeaderNavigation />
          </div>
          <div className="flex gap-8 items-end">
            <div className="self-center">
              <HeaderSearch small={true} />
            </div>
            <HeaderActions />
            <HeaderCartButton />
          </div>
        </header>
      </div>
    </div>
  );
}
