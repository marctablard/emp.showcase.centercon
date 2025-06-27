import { useEffect, useRef } from 'react';

/**
 * Custom hook to enable horizontal scrolling with the mouse wheel
 * @returns A ref to be attached to the scrollable element
 */
export function useHorizontalScroll() {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;

      // Prevent the default vertical scroll
      e.preventDefault();

      // Scroll horizontally instead
      el.scrollLeft += e.deltaY;
    };

    // Add event listener
    el.addEventListener('wheel', handleWheel, { passive: false });

    // Clean up
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return elRef;
}
