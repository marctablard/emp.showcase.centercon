'use client';

import { useEffect, useState } from 'react';
import { HeaderCollapsed } from '@/components/header/collapsed/header-collapsed';
import { HeaderExpanded } from '@/components/header/expanded/header-expanded';
import { HeaderMobile } from '@/components/header/mobile/header-mobile';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function Header() {
  const isMediumScreen = useBreakpoint('md');
  const isLargeScreen = useBreakpoint('lg');
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollThreshold = isLargeScreen ? 100 : 60;

  useEffect(() => {
    setIsMounted(true);

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

  // SSR-Fallback: Shows the desktop variant on first render
  if (!isMounted) {
    return (
      <div className="has-[.search]:fixed has-[.search]:backdrop-blur-xs has-[.search]:z-60 h-full w-full relative">
        <div className="fixed top-0 left-0 right-0 pt-4 z-50 max-w-6xl mx-auto">
          <header className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl relative transition-all duration-200 ease-in-out mx-4 lg:mx-9 h-[169px]">
            <div className="transition-all duration-200 ease-in-out absolute top-0 left-0 right-0 w-full opacity-100 z-2">
              <HeaderExpanded />
            </div>
          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="has-[.search]:fixed has-[.search]:backdrop-blur-xs has-[.search]:z-60 h-full w-full relative">
      {isMediumScreen ? (
        /* Desktop & Tablet */
        <div className="fixed top-0 left-0 right-0 pt-4 z-50 max-w-6xl mx-auto">
          <header
            className={`bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl relative transition-[height] duration-200 ease-in-out mx-4 lg:mx-9 ${scrolled ? 'h-16' : getHeaderHeight()}`}
          >
            {/* Render only one header component based on scroll state */}
            {!scrolled ? (
              <div className="transition-[height] duration-200 ease-in-out absolute top-0 left-0 right-0 w-full opacity-100 z-2">
                <HeaderExpanded />
              </div>
            ) : (
              <div className="flex justify-between items-center transition-[height] duration-200 ease-in-out absolute top-0 left-0 right-0 h-[64px] px-6 opacity-100 transform translate-y-0 z-2">
                <HeaderCollapsed />
              </div>
            )}
          </header>
        </div>
      ) : (
        /* Mobile */
        <div className="w-full">
          <HeaderMobile />
        </div>
      )}
    </div>
  );
}
