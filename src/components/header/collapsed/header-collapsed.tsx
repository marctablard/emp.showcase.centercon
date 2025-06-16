import Image from 'next/image';
import HeaderMenu from '@/components/header/collapsed/header-menu';
import HeaderActions from '@/components/header/common/header-actions';
import HeaderCartButton from '@/components/header/common/header-cart-button';
import HeaderNavigation from '@/components/header/common/header-navigation';
import HeaderSearch from '@/components/header/common/header-search';
import { Link } from '@/i18n/navigation';

export default function HeaderCollapsed() {
  return (
    <>
      <div className="flex gap-8 items-center">
        <Link href="/">
          <Image src="/images/logo_small.svg" alt="Logo" width="25" height="22" className="min-w-[25px] min-h-[22px]" />
        </Link>
        <div className="hidden lg:block">
          <HeaderNavigation />
        </div>
      </div>
      <div className="flex gap-8 items-end">
        <div className="self-center">
          <HeaderSearch small />
        </div>
        <HeaderActions />
        <HeaderCartButton />
        <div className="lg:hidden">
          <HeaderMenu />
        </div>
      </div>
    </>
  );
}
