'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { HeaderActions } from '@/components/header/common/header-actions';
import { HeaderIconButton } from '@/components/header/common/header-icon-button';
import { HeaderLogo } from '@/components/header/common/header-logo';
import { HeaderNavigation } from '@/components/header/common/header-navigation';
import { HeaderSearch } from '@/components/header/common/search/header-search';
import { SearchInputProps } from '@/hooks/search/useSearchInput';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface HeaderCompactProps extends SearchInputProps {
  isCollapsedHeader?: boolean;
  showMenu?: boolean;
  onToggleMenu?: () => void;
}

export function HeaderCompact(props: HeaderCompactProps) {
  const { showSearch, activateSearch, isCollapsedHeader, showMenu: externalShowMenu, onToggleMenu } = props;
  const t = useTranslations('layout.header');
  const isAboveSmallScreen = useBreakpoint('sm');
  const [internalShowMenu, setInternalShowMenu] = useState(false);

  const showMenu = externalShowMenu !== undefined ? externalShowMenu : internalShowMenu;
  const toggleMenu = onToggleMenu || (() => setInternalShowMenu(!internalShowMenu));

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center gap-4 px-6 w-full h-16">
        <HeaderSearch small={false} show={showSearch} searchInput={props} isCollapsedHeader={isCollapsedHeader} />

        <div className={`flex items-center ${showSearch ? 'w-0 opacity-0 hidden' : ''}`}>
          {isAboveSmallScreen ? (
            <HeaderLogo small width={25} height={22} className="min-w-[25px] min-h-[22px]" title={t('home')} />
          ) : (
            <HeaderLogo small width={18} height={16} className="min-w-[18px] min-h-[16px]" title={t('home')} />
          )}
        </div>
        <div className={`flex gap-8 items-end ${showSearch ? 'w-0 opacity-0 hidden' : ''}`}>
          <HeaderActions onToggleSearch={activateSearch} />
          <HeaderCartButton />
          <HeaderIconButton
            icon={showMenu ? X : Menu}
            text={t('menu')} // t('close')
            onClick={toggleMenu}
          />
        </div>
      </div>

      {/* Navigation Menu */}
      {showMenu && (
        <div className="px-6 py-4 border-t border-border-subtle w-full">
          <div className="flex justify-between">
            <HeaderNavigation />
          </div>
        </div>
      )}
    </div>
  );
}
