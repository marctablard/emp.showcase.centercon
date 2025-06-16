import { useEffect, useState } from 'react';

// Tailwind-Breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsAboveBreakpoint(window.innerWidth >= breakpoints[breakpoint]);
    };

    checkSize();

    window.addEventListener('resize', checkSize);

    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]);

  return isAboveBreakpoint;
}
