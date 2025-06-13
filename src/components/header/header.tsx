import HeaderBottomBar from '@/components/header/header-bottom-bar';
import HeaderMiddleBar from '@/components/header/header-middle-bar';
import HeaderTopBanner from '@/components/header/header-top-banner';

export default async function Header() {
  return (
    <div className="sticky top-0 left-0 right-0 pt-4 z-50">
      <header className="bg-white opacity-95 shadow-xl rounded-2xl px-6 pb-2 mx-9">
        <HeaderTopBanner />
        <HeaderMiddleBar />
        <HeaderBottomBar />
      </header>
    </div>
  );
}
