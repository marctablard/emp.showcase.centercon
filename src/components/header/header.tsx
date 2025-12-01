'use client';

import { useState } from 'react';
import { HeaderExpanded } from '@/components/header/expanded/header-expanded';
import { HeaderCompact } from '@/components/header/header-compact';
import { HeaderMobile } from '@/components/header/header-mobile';
import { useSearchInput } from '@/hooks/search/useSearchInput';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';

export function Header() {
  const { scrolled, getHeaderHeight } = useHeaderScroll();
  const [showCompactMenu, setShowCompactMenu] = useState(false);
  const searchInput = useSearchInput();

  return (
    <header className="has-[.search]:fixed has-[.search]:backdrop-blur-default has-[.search]:z-60 h-full w-full relative">
      {/* Desktop & Tablet */}
      <div className="fixed top-0 left-0 right-0 pt-4 z-50 max-w-6xl mx-auto hidden md:block">
        <div
          className={`bg-surface-page/95 backdrop-blur-default shadow-sm rounded-lg relative transition-[height] duration-200 ease-in-out mx-4 md:mx-9 ${scrolled ? (showCompactMenu ? 'h-auto' : 'h-16') : getHeaderHeight()}`}
        >
          {/* Render only one header component based on scroll state */}
          {!scrolled ? (
            <div className="transition-[height] duration-200 ease-in-out absolute top-0 left-0 right-0 w-full opacity-100 z-2">
              <HeaderExpanded {...searchInput} />
            </div>
          ) : (
            <div
              className={`transition-[height] duration-200 ease-in-out ${showCompactMenu ? 'relative' : 'absolute'} top-0 left-0 right-0 opacity-100 transform translate-y-0 z-2`}
            >
              <HeaderCompact
                {...searchInput}
                isCollapsedHeader={true}
                showMenu={showCompactMenu}
                onToggleMenu={() => setShowCompactMenu(!showCompactMenu)}
              />
            </div>
          )}
        </div>
      </div>
      {/* Mobile */}
      <div className="w-full md:hidden">
        <HeaderMobile {...searchInput} />
      </div>
    </header>
  );
}
