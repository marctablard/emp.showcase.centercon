import { useTranslations } from 'next-intl';
import { Logo } from '@/components/common/logo/logo';
import { HeaderActions } from '@/components/header/common/header-actions';
import { HeaderSearch } from '@/components/header/common/search/header-search';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function HeaderMiddleBar() {
  const t = useTranslations('layout.header');
  const isExtraLargeScreen = useBreakpoint('xl');

  return (
    <div
      className={`flex self-stretch w-full pt-6 items-center justify-between has-[.search]:[&_.hide-on-focus]:opacity-0 has-[.search]:[&_.hide-on-focus]:w-0`}
    >
      <div className="w-[223px] transition-all duration-300 hide-on-focus">
        <Logo width={148} height={24} className="min-w-[148px] min-h-[24px]" title={t('home')} />
      </div>

      <HeaderSearch small={!isExtraLargeScreen} />
      <HeaderActions className="transition-all duration-300 hide-on-focus" />
    </div>
  );
}
