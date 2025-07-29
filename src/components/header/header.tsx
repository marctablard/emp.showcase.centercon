'use client';

import { useEffect, useState } from 'react';
import { HeaderExpanded } from '@/components/header/expanded/header-expanded';
import { HeaderCompact } from '@/components/header/header-compact';
import { HeaderMobile } from '@/components/header/header-mobile';
import { useSearchInput } from '@/hooks/search/useSearchInput';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';

export function Header() {
  const isMediumScreen = useBreakpoint('md');
  const { scrolled, getHeaderHeight } = useHeaderScroll();
  const [isMounted, setIsMounted] = useState(false);
  const searchInput = useSearchInput();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR-Fallback: Shows the desktop variant on first render
  if (!isMounted) {
    return (
      <div className="has-[.search]:fixed has-[.search]:backdrop-blur-xs has-[.search]:z-60 h-full w-full relative">
        <div className="fixed top-0 left-0 right-0 pt-4 z-50 max-w-6xl mx-auto">
          <header className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl relative transition-all duration-200 ease-in-out mx-4 lg:mx-9 h-[169px]">
            <div className="transition-all duration-200 ease-in-out absolute top-0 left-0 right-0 w-full opacity-100 z-2">
              <HeaderExpanded {...searchInput} />
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
                <HeaderExpanded {...searchInput} />
              </div>
            ) : (
              <div className="flex transition-[height] duration-200 ease-in-out absolute top-0 left-0 right-0 h-[64px] opacity-100 transform translate-y-0 z-2">
                <HeaderCompact {...searchInput} isCollapsedHeader={true} />
              </div>
            )}
          </header>
        </div>
      ) : (
        /* Mobile */
        <div className="w-full">
          <HeaderMobile {...searchInput} />
        </div>
      )}
    </div>
  );
}
