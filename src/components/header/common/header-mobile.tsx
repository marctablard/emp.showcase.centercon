'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Gauge, LayoutGrid, Menu, Pin, Search, X } from 'lucide-react';
import { HeaderIconButton } from '@/components/header/common/header-icon-button';
import { HeaderIconLink } from '@/components/header/common/header-icon-link';
import { HeaderSearch } from '@/components/header/common/header-search';
import { MobileMenuNavigation } from '@/components/header/mobile/menu-navigation';
import { useHeaderSearch } from '@/components/header/search/search-context';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function HeaderMobile() {
  const t = useTranslations('layout.header');
  const { showSearch, activateSearch } = useHeaderSearch();
  const [open, setOpen] = useState(false);
  const isAboveSmallScreen = useBreakpoint('sm');

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  if (open && isAboveSmallScreen) {
    closeMenu();
  }

  return (
    <>
      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-60 w-full bg-surface-page/95 backdrop-blur-default shadow-sm h-[58px] flex justify-around items-center text-nowrap">
        {showSearch && (
          <div className="mx-4 w-full">
            <HeaderSearch show={showSearch} />
          </div>
        )}
        {!showSearch && (
          <>
            <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
            <HeaderIconButton icon={Search} text={t('shortSearch')} onClick={activateSearch} />
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <Button
                  onClick={toggleMenu}
                  className="flex flex-col w-16 h-16 min-w-12 min-h-[46px] px-3 py-1 border-0 justify-center items-center rounded-ss-sm rounded-se-none rounded-es-none rounded-ee-sm bg-gradient-to-t from-gradient-secondary-end to-gradient-secondary-start text-text-on-action normal-case tracking-normal"
                  aria-label={open ? t('close') : t('menu')}
                >
                  {open ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                  <span className="text-sm font-bold -mt-4">{t('menu')}</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="mx-4 border-x data-[vaul-drawer-direction=bottom]:max-h-[calc(100dvh-68px-58px-16px-env(safe-area-inset-top))] min-h-[calc(100dvh-68px-58px-16px-env(safe-area-inset-top))] data-[vaul-drawer-direction=bottom]:bottom-[58px]">
                <VisuallyHidden>
                  <DrawerTitle>{t('menu')}</DrawerTitle>
                </VisuallyHidden>
                <MobileMenuNavigation onClose={closeMenu} />
              </DrawerContent>
            </Drawer>
            <HeaderIconLink icon={LayoutGrid} text={t('products')} href="/#" />
            <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
          </>
        )}
      </div>
    </>
  );
}
