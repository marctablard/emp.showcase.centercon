import { useTranslations } from 'next-intl';
import { Logo } from '@/components/common/logo/logo';
import { HeaderMenu } from '@/components/header/collapsed/header-menu';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { HeaderActions } from '@/components/header/common/header-actions';
import { HeaderSearch } from '@/components/header/common/search/header-search';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { HeaderNavigation } from '../common/header-navigation';

export function HeaderCollapsed() {
  const t = useTranslations('layout.header');
  const isExtraExtraLargeScreen = useBreakpoint('2xl');
  const isLargeScreen = useBreakpoint('lg');

  return (
    <>
      <div className="flex gap-8 items-center">
        {isLargeScreen ? (
          <Logo small width={25} height={22} className="min-w-[25px] min-h-[22px]" title={t('home')} />
        ) : (
          <Logo small width={18} height={16} className="min-w-[18px] min-h-[16px]" title={t('home')} />
        )}
        {isExtraExtraLargeScreen && <HeaderNavigation className="mr-8" />}
      </div>
      <div className="flex gap-8 items-end group">
        <HeaderSearch small className="self-center" />
        <HeaderActions />
        <HeaderCartButton />
        {!isExtraExtraLargeScreen && (
          <HeaderMenu className="transition-all duration-300 group-focus-within:w-0 group-focus-within:opacity-0" />
        )}
      </div>
    </>
  );
}
