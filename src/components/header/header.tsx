'use client';

import { useEffect, useState } from 'react';
import HeaderCollapsed from '@/components/header/collapsed/header-collapsed';
import HeaderExpanded from '@/components/header/expanded/header-expanded';
import HeaderMobile from '@/components/header/mobile/header-mobile';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function Header() {
  const isLargeScreen = useBreakpoint('lg');
  const [scrolled, setScrolled] = useState(false);
  const scrollThreshold = isLargeScreen ? 100 : 60;

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > scrollThreshold;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold, scrolled]);

  function getHeaderHeight() {
    if (!scrolled) {
      if (isLargeScreen) return 'h-[169px]';
      return 'h-[111px]';
    }

    return '';
  }

  return (
    <div className="has-[.search]:fixed has-[.search]:backdrop-blur-xs has-[.search]:z-60 h-full w-full relative">
      {/* Desktop & Tablet */}
      <div className="hidden md:block fixed top-0 left-0 right-0 pt-4 z-50 max-w-6xl mx-auto">
        <header
          className={`bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl relative transition-all duration-200 ease-in-out mx-4 lg:mx-9 ${scrolled ? 'h-16' : getHeaderHeight()}`}
        >
          <div
            className={`transition-all duration-200 ease-in-out absolute top-0 left-0 right-0 w-full ${scrolled ? 'opacity-0 pointer-events-none transform -translate-y-4 -z-1' : 'opacity-100 z-2'}`}
          >
            <HeaderExpanded />
          </div>

          <div
            className={`flex justify-between items-center transition-all duration-200 ease-in-out absolute top-0 left-0 right-0 h-[64px] px-6 ${scrolled ? 'opacity-100 transform translate-y-0 z-2' : 'opacity-0 pointer-events-none transform translate-y-4 -z-1'}`}
          >
            <HeaderCollapsed />
          </div>
        </header>
      </div>

      {/* Mobile */}
      <div className="md:hidden w-full">
        <HeaderMobile />
      </div>
    </div>
  );
}
