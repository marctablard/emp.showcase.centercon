import { useTranslations } from 'next-intl';
import { Logo } from '@/components/common/logo/logo';
import { HeaderMenu } from '@/components/header/collapsed/header-menu';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { HeaderActions } from '@/components/header/common/header-actions';
import { HeaderBottomBar } from '@/components/header/expanded/header-bottom-bar';
import { HeaderMiddleBar } from '@/components/header/expanded/header-middle-bar';
import { HeaderTopBanner } from '@/components/header/expanded/header-top-banner';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function HeaderExpanded() {
  const isLargeScreen = useBreakpoint('lg');
  const t = useTranslations('layout.header');

  return (
    <>
      <HeaderTopBanner />

      {isLargeScreen ? (
        /* Desktop */
        <div className="px-6 pb-2">
          <HeaderMiddleBar />
          <HeaderBottomBar />
        </div>
      ) : (
        /* Tablet */
        <div className="flex justify-between items-center px-6 pt-6">
          <Logo small width={18} height={16} className="min-w-[18px] min-h-[16px]" title={t('home')} />
          <div className="flex gap-8 items-end">
            <HeaderActions />
            <HeaderCartButton />
            <HeaderMenu />
          </div>
        </div>
      )}
    </>
  );
}
