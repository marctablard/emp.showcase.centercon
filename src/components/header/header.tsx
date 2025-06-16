'use client';

import { useEffect, useState } from 'react';
import HeaderCollapsed from '@/components/header/collapsed/header-collapsed';
import HeaderExpanded from '@/components/header/expanded/header-expanded';

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
      <header
        className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl mx-9 relative transition-all duration-300 ease-in-out"
        style={{ height: scrolled ? '64px' : '168px' }}
      >
        <div
          className={`transition-all duration-300 ease-in-out absolute top-0 left-0 right-0 w-full ${
            scrolled ? 'opacity-0 transform -translate-y-4' : 'opacity-100'
          }`}
        >
          <HeaderExpanded />
        </div>

        <div
          className={`flex justify-between items-center transition-all duration-300 ease-in-out absolute top-0 left-0 right-0 h-[64px] px-6 ${
            scrolled ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}
        >
          <HeaderCollapsed />
        </div>
      </header>
    </div>
  );
}
