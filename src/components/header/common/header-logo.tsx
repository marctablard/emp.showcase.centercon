'use client';

import { useTranslations } from 'next-intl';
import { useHeaderSearch } from '@/components/header/search/search-context';
import { breakpoints } from '@/hooks/useBreakpoint';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface HeaderLogoProps {
  scrolled: boolean;
  className?: string;
  title?: string;
  largeImageBreakpoint?: keyof typeof breakpoints;
}

export const HeaderLogo = ({ scrolled, className, title, largeImageBreakpoint }: HeaderLogoProps) => {
  const { showSearch } = useHeaderSearch();
  const t = useTranslations('layout.header');
  const linkTitle = title || t('home');
  const mobileLogo = '/images/logo_small.svg';
  const desktopLogo = '/images/logo.svg';
  largeImageBreakpoint = largeImageBreakpoint || 'md';

  return (
    <Link
      href="/"
      title={linkTitle}
      className={cn('flex shrink-0 items-center', showSearch ? 'sm:hidden' : '', className)}
    >
      <picture>
        {!scrolled && <source media={`(min-width: ${breakpoints[largeImageBreakpoint]}px)`} srcSet={desktopLogo} />}
        <img
          src={mobileLogo}
          alt="Centercon"
          className={cn(
            'block h-[32px] w-auto',
            largeImageBreakpoint === 'sm' && 'sm:h-[58px]',
            !scrolled && 'md:h-[58px]',
            scrolled && 'md:h-[34px]',
          )}
        />
      </picture>
    </Link>
  );
};
