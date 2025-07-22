import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { HeaderMenu } from '@/components/header/collapsed/header-menu';
import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { HeaderActions } from '@/components/header/common/header-actions';
import { HeaderSearch } from '@/components/header/common/search/header-search';
import { Link } from '@/i18n/navigation';
import { HeaderNavigation } from '../common/header-navigation';

export function HeaderCollapsed() {
  const t = useTranslations('header');
  return (
    <>
      <div className="flex gap-8 items-center">
        <Link className="hidden 2xl:block" href="/" title={t('home')}>
          <Image src="/images/logo_small.svg" alt="Logo" width="25" height="22" className="min-w-[25px] min-h-[22px]" />
        </Link>
        <Link className="2xl:hidden mr-8" href="/" title={t('home')}>
          <Image src="/images/logo.svg" alt="Logo" width="108" height="16" className="min-w-[108] min-h-[16]" />
        </Link>
        <div className="hidden 2xl:block mr-8">
          <HeaderNavigation />
        </div>
      </div>
      <div className="flex gap-8 items-end group">
        <div className="self-center">
          <HeaderSearch small />
        </div>
        <HeaderActions />
        <HeaderCartButton />
        <div className="2xl:hidden transition-all duration-300 group-focus-within:w-0 group-focus-within:opacity-0">
          <HeaderMenu />
        </div>
      </div>
    </>
  );
}
