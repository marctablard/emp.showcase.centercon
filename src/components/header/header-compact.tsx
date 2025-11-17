import { useTranslations } from 'next-intl';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { HeaderActions } from '@/components/header/common/header-actions';
import { HeaderLogo } from '@/components/header/common/header-logo';
import { HeaderMenu } from '@/components/header/common/header-menu';
import { HeaderSearch } from '@/components/header/common/search/header-search';
import { SearchInputProps } from '@/hooks/search/useSearchInput';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface HeaderCompactProps extends SearchInputProps {
  isCollapsedHeader?: boolean;
}

export function HeaderCompact(props: HeaderCompactProps) {
  const { showSearch, activateSearch, isCollapsedHeader } = props;
  const t = useTranslations('layout.header');
  const isAboveSmallScreen = useBreakpoint('sm');

  return (
    <>
      <div className="flex justify-between items-center gap-4 px-6 w-full">
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
          <HeaderMenu />
        </div>
      </div>
    </>
  );
}
