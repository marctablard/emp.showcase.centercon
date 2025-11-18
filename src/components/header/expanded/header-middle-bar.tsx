import { useTranslations } from 'next-intl';
import { HeaderActions } from '@/components/header/common/header-actions';
import { HeaderLogo } from '@/components/header/common/header-logo';
import { HeaderSearch } from '@/components/header/common/search/header-search';
import { SearchInputProps } from '@/hooks/search/useSearchInput';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function HeaderMiddleBar(props: SearchInputProps) {
  const t = useTranslations('layout.header');
  const isAboveLargeScreen = useBreakpoint('lg');
  const isAboveMediumScreen = useBreakpoint('md');
  const {} = props;

  return (
    <div
      className={`flex self-stretch w-full pt-6 items-center justify-between has-[.search]:[&_.hide-on-focus]:opacity-0 has-[.search]:[&_.hide-on-focus]:w-0`}
    >
      <div className="w-[223px] transition-all duration-100 hide-on-focus">
        <HeaderLogo width={148} height={24} className="min-w-[148px] min-h-[24px]" title={t('home')} />
      </div>
      <HeaderSearch small={!isAboveLargeScreen} show={isAboveMediumScreen} searchInput={props} />
      <HeaderActions
        className="hide-on-focus"
        onToggleSearch={props.toggleSearch}
        hideSearchIcon={isAboveMediumScreen}
      />
    </div>
  );
}
