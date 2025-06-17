import { useEffect, useState } from 'react';

/**
 * Standard Tailwind CSS breakpoints in pixels
 * These match the min-width values defined in Tailwind's default configuration
 * @see https://tailwindcss.com/docs/responsive-design
 */
const breakpoints = {
  sm: 640, // Small screens, like mobile phones in landscape
  md: 768, // Medium screens, like tablets
  lg: 1024, // Large screens, like laptops
  xl: 1280, // Extra large screens, like desktops
  '2xl': 1536, // 2x extra large screens, like large desktops
};

/**
 * Type representing valid Tailwind breakpoint names
 */
type Breakpoint = keyof typeof breakpoints;

/**
 * React hook that detects if the current viewport width is at or above a specified Tailwind breakpoint
 *
 * @param breakpoint - The Tailwind breakpoint to check against ('sm', 'md', 'lg', 'xl', '2xl')
 * @returns boolean - True if the current viewport width is >= the specified breakpoint width, otherwise false
 *
 * @example
 * // Check if the screen is at least 'lg' (1024px) wide
 * const isLargeScreen = useBreakpoint('lg');
 *
 * // Use with negation to check if the screen is below a breakpoint
 * const isMobile = !useBreakpoint('md'); // True when screen width < 768px
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  // Track whether the current viewport width is at or above the specified breakpoint
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(false);

  useEffect(() => {
    // Function to check and update the breakpoint state
    const checkSize = () => {
      setIsAboveBreakpoint(window.innerWidth >= breakpoints[breakpoint]);
    };

    // Initial check when component mounts
    checkSize();

    // Add event listener to update state when window is resized
    window.addEventListener('resize', checkSize);

    // Clean up event listener when component unmounts
    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]); // Re-run effect if breakpoint parameter changes

  return isAboveBreakpoint;
}
