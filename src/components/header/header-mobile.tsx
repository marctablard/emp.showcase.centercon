'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Gauge, LayoutGrid, Menu, Pin, Search, X } from 'lucide-react';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { HeaderActions } from '@/components/header/common/header-actions';
import { HeaderIconButton } from '@/components/header/common/header-icon-button';
import { HeaderIconLink } from '@/components/header/common/header-icon-link';
import { HeaderLogo } from '@/components/header/common/header-logo';
import { MobileMenuNavigation } from '@/components/header/common/mobile-menu-navigation';
import { HeaderSearch } from '@/components/header/common/search/header-search';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SearchInputProps } from '@/hooks/search/useSearchInput';

export function HeaderMobile(props: SearchInputProps) {
  const t = useTranslations('layout.header');
  const { showSearch, activateSearch } = props;
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(!showMenu);
  const closeMenu = () => setShowMenu(false);

  return (
    <>
      {/* Top */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <header className="bg-surface-page/95 backdrop-blur-default shadow-sm px-4 py-2 h-17">
          <div className="flex h-full justify-between items-center">
            <HeaderLogo small width={18} height={16} className="min-w-[18px] min-h-[16px]" title={t('home')} />
            <div className="flex gap-2">
              <HeaderActions onToggleSearch={activateSearch} />
              <HeaderCartButton />
            </div>
          </div>
        </header>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] w-full bg-surface-page/95 backdrop-blur-default shadow-sm h-[58px] flex justify-around items-center text-nowrap">
        {showSearch && (
          <div className="mx-4 w-full">
            <HeaderSearch small={false} show={showSearch} searchInput={props} />
          </div>
        )}
        {!showSearch && (
          <>
            <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
            <HeaderIconButton icon={Search} text={t('shortSearch')} onClick={activateSearch} />
            <Button
              onClick={toggleMenu}
              className="flex flex-col w-16 h-16 min-w-12 min-h-[46px] px-3 py-1 border-0 justify-center items-center rounded-ss-md rounded-se-none rounded-es-none rounded-ee-md bg-gradient-to-t from-gradient-secondary-end to-gradient-secondary-start text-text-on-action normal-case tracking-normal"
            >
              {showMenu ? (
                <>
                  <X className="w-8 h-8" />
                  <p className="text-sm font-bold -mt-4">{t('menu')}</p>
                </>
              ) : (
                <>
                  <Menu className="w-8 h-8" />
                  <p className="text-sm font-bold -mt-4">{t('menu')}</p>
                </>
              )}
            </Button>
            <HeaderIconLink icon={LayoutGrid} text={t('products')} href="/#" />
            <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
          </>
        )}
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={showMenu} onOpenChange={setShowMenu} modal={true}>
        <SheetContent
          side="bottom"
          className="h-[calc(100dvh-58px-env(safe-area-inset-top))] bottom-[58px] p-0 rounded-t-2xl [&>button]:hidden"
          onInteractOutside={closeMenu}
        >
          <SheetTitle className="sr-only">{t('menu')}</SheetTitle>
          <MobileMenuNavigation onClose={closeMenu} />
        </SheetContent>
      </Sheet>
    </>
  );
}
