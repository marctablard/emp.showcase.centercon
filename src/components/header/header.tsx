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
      <div
        className={`transition-all duration-200 ease-in-out ${scrolled ? 'opacity-0 overflow-hidden max-h-0' : 'opacity-100 max-h-[200px]'}`}
      >
        <HeaderExpanded />
      </div>

      <div
        className={`transition-all duration-200 ease-in-out ${
          scrolled ? 'opacity-100 max-h-[100px]' : 'opacity-0 overflow-hidden max-h-0'
        }`}
      >
        <HeaderCollapsed />
      </div>
    </div>
  );
}
