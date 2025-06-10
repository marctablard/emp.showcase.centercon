import HeaderBottomBar from '@/components/header/header-bottom-bar';
import HeaderMiddleBar from '@/components/header/header-middle-bar';
import HeaderTopBanner from '@/components/header/header-top-banner';

export default async function Header() {
  return (
    <header className="bg-white opacity-95 shadow-xl rounded-2xl px-6 pb-2 pt-0 mx-9 mt-4">
      <HeaderTopBanner />
      <HeaderMiddleBar />
      <HeaderBottomBar />
    </header>
  );
}
