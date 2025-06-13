'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import HeaderBottomBar from '@/components/header/header-bottom-bar';
import HeaderMiddleBar from '@/components/header/header-middle-bar';
import HeaderNavigation from '@/components/header/header-navigation';
import HeaderTopBanner from '@/components/header/header-top-banner';

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
        className={`transition-all duration-200 ease-in-out ${scrolled ? 'opacity-0 overflow-hidden' : 'opacity-100'}`}
      >
        <header className="bg-white opacity-95 shadow-xl rounded-2xl px-6 pb-2 mx-9">
          <HeaderTopBanner />
          <HeaderMiddleBar />
          <HeaderBottomBar />
        </header>
      </div>

      <div
        className={`transition-all duration-200 ease-in-out absolute w-full top-3 ${
          scrolled ? 'opacity-100' : 'opacity-0 overflow-hidden'
        }`}
      >
        <header className="bg-white opacity-95 shadow-lg rounded-2xl px-6 py-2 mx-9">
          <div className="flex gap-8 items-center">
            <Image src="/logo_small.svg" alt="Logo" width="25" height="22" />
            <HeaderNavigation />
          </div>
        </header>
      </div>
    </div>
  );
}
