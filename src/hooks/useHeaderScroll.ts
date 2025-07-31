import { useEffect, useState } from 'react';
import { useBreakpoint } from './useBreakpoint';

interface UseHeaderScrollOptions {
  /**
   * Custom scroll threshold in pixels
   */
  customThreshold?: number;
}

/**
 * Hook to handle header scroll behavior
 * Returns scroll state and header height classes based on scroll position
 */
export function useHeaderScroll(options?: UseHeaderScrollOptions) {
  const isLargeScreen = useBreakpoint('lg');
  const [scrolled, setScrolled] = useState(false);

  // Use custom threshold if provided, otherwise calculate based on screen size
  const scrollThreshold = options?.customThreshold ?? (isLargeScreen ? 100 : 60);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > scrollThreshold;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold, scrolled]);

  /**
   * Returns the appropriate header height class based on scroll state
   */
  const getHeaderHeight = () => {
    if (!scrolled) {
      if (isLargeScreen) return 'h-[169px]';
      return 'h-[116px]';
    }

    return '';
  };

  return {
    scrolled,
    getHeaderHeight,
    isLargeScreen,
  };
}
