import { useTranslations } from 'next-intl';
import Image from 'next/image';
import HeaderMenu from '@/components/header/collapsed/header-menu';
import HeaderActions from '@/components/header/common/header-actions';
import HeaderCartButton from '@/components/header/common/header-cart-button';
import HeaderSearch from '@/components/header/common/search/header-search';
import { Link } from '@/i18n/navigation';
import HeaderNavigation from '../common/header-navigation';

export default function HeaderCollapsed() {
  const t = useTranslations('header');
  return (
    <>
      <div className="flex gap-8 items-center">
        <Link className="hidden lg:block" href="/" title={t('home')}>
          <Image src="/images/logo_small.svg" alt="Logo" width="25" height="22" className="min-w-[25px] min-h-[22px]" />
        </Link>
        <Link className="lg:hidden" href="/" title={t('home')}>
          <Image src="/images/logo.svg" alt="Logo" width="108" height="16" className="min-w-[108] min-h-[16]" />
        </Link>
        <div className="hidden xl:block">
          <HeaderNavigation />
        </div>
      </div>
      <div className="flex gap-8 items-end group">
        <div className="self-center">
          <HeaderSearch small />
        </div>
        <HeaderActions />
        <HeaderCartButton />
        <div className="xl:hidden transition-all duration-300 group-focus-within:w-0 group-focus-within:opacity-0">
          <HeaderMenu />
        </div>
      </div>
    </>
  );
}
