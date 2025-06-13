import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import HeaderBottomBar from '@/components/header/header-bottom-bar';
import HeaderMiddleBar from '@/components/header/header-middle-bar';
import HeaderNavigation from '@/components/header/header-navigation';
import HeaderTopBanner from '@/components/header/header-top-banner';

export default async function Header() {
  const t = await getTranslations('header');

  return (
    <div className="sticky top-0 left-0 right-0 pt-4 z-50">
      <header className="bg-white opacity-95 shadow-xl rounded-2xl px-6 pb-2 mx-9 hidden">
        <HeaderTopBanner />
        <HeaderMiddleBar />
        <HeaderBottomBar />
      </header>

      <div className="sticky top-0 left-0 right-0 pt-4 z-50">
        <header className="bg-white opacity-95 shadow-lg rounded-2xl px-6 py-2 mx-9">
          <div className="flex gap-8">
            <Image src="/logo_small.svg" alt="Logo" width="25" height="22" />
            <HeaderNavigation />
          </div>
        </header>
      </div>
    </div>
  );
}
