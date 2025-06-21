import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Gauge, LayoutGrid, Menu, Pin, Search } from 'lucide-react';
import HeaderActions from '@/components/header/common/header-actions';
import HeaderCartButton from '@/components/header/common/header-cart-button';
import HeaderIconLink from '@/components/header/common/header-icon-link';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default function HeaderMobile() {
  const t = useTranslations('header');
  return (
    <>
      {/* Top */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <header className="bg-white/95 backdrop-blur-sm shadow-xl px-4 py-2 h-17">
          <div className="flex h-full justify-between items-center">
            <Link href="/">
              <Image src="/images/logo.svg" alt="Logo" width="108" height="16" className="min-w-[108px] min-h-[16px]" />
            </Link>
            <div className="flex gap-2">
              <HeaderActions />
              <HeaderCartButton />
            </div>
          </div>
        </header>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-xl h-[58px] flex justify-between items-center text-nowrap">
        <HeaderIconLink icon={Gauge} text={t('quickOrder')} href="/#" />
        <HeaderIconLink icon={Search} text={t('shortSearch')} href="/#" />
        {/* Todo: When clicking on Menu, toggle between below buttons */}
        <Button className="flex flex-col w-16 h-16 min-w-12 min-h-[46px] px-3 py-1 border-0 justify-center items-center rounded-tl-lg rounded-tr-none rounded-bl-none rounded-br-lg bg-gradient-to-t from-primary-700 to-primary-500 text-white normal-case tracking-normal">
          <Menu className="w-8 h-8" />
          <p className="text-sm font-bold -mt-4">{t('menu')}</p>
        </Button>
        {/*<Button className="flex flex-col w-16 h-16 min-w-12 min-h-[46px] px-3 py-1 justify-center items-center rounded-tl-lg rounded-br-lg bg-gradient-to-t from-primary-700 to-primary-500 text-white normal-case tracking-normal">*/}
        {/*  <X className="w-8 h-8" />*/}
        {/*  <p className="text-sm font-bold -mt-4">{t('close')}</p>*/}
        {/*</Button>*/}
        <HeaderIconLink icon={LayoutGrid} text={t('products')} href="/#" />
        <HeaderIconLink icon={Pin} text={t('wishlists')} href="/#" />
      </div>
    </>
  );
}
