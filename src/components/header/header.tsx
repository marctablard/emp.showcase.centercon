'use client';

import { HeaderActionBar } from '@/components/header/common/header-action-bar';
import { HeaderMobile } from '@/components/header/common/header-mobile';
import { HeaderTopBanner } from '@/components/header/common/header-top-banner';
import { HeaderSearchProvider } from '@/components/header/search/search-context';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useHeaderScroll } from '@/hooks/useHeaderScroll';

export function Header() {
  const { scrolled } = useHeaderScroll();
  const isAboveSmallScreen = useBreakpoint('sm');
  return (
    <HeaderSearchProvider>
      <header className="relative z-60 pointer-events-auto has-[.search]:fixed has-[.search]:w-full has-[.search]:h-full has-[.search]:backdrop-blur-default">
        {/* Mobile & Tablet & Desktop */}
        <div className="fixed top-0 left-0 right-0 z-60 sm:pt-4 sm:px-4 md:pt-3 lg:px-9 w-full max-w-6xl mx-auto">
          <HeaderTopBanner scrolled={scrolled} />
          <HeaderActionBar scrolled={scrolled} />
        </div>
        {/* Mobile */}
        {!isAboveSmallScreen && <HeaderMobile />}
      </header>
    </HeaderSearchProvider>
  );
}
