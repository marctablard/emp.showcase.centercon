import Image from 'next/image';
import HeaderMenu from '@/components/header/collapsed/header-menu';
import HeaderActions from '@/components/header/common/header-actions';
import HeaderCartButton from '@/components/header/common/header-cart-button';
import HeaderBottomBar from '@/components/header/expanded/header-bottom-bar';
import HeaderMiddleBar from '@/components/header/expanded/header-middle-bar';
import HeaderTopBanner from '@/components/header/expanded/header-top-banner';
import { Link } from '@/i18n/navigation';

export default function HeaderExpanded() {
  return (
    <>
      <HeaderTopBanner />
      <div className="px-6 pb-2 hidden lg:block">
        <HeaderMiddleBar />
        <HeaderBottomBar />
      </div>

      <div className="lg:hidden flex justify-between items-center px-6 pt-6">
        <div className="flex gap-8 items-center">
          <Link href="/">
            <Image src="/images/logo.svg" alt="Logo" width="108" height="16" className="min-w-[108px] min-h-[16px]" />
          </Link>
        </div>
        <div className="flex gap-8 items-end">
          <HeaderActions />
          <HeaderCartButton />
          <HeaderMenu />
        </div>
      </div>
    </>
  );
}
