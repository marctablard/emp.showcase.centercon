import HeaderBottomBar from '@/components/header/expanded/header-bottom-bar';
import HeaderMiddleBar from '@/components/header/expanded/header-middle-bar';
import HeaderTopBanner from '@/components/header/expanded/header-top-banner';

export default function HeaderExpanded() {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl px-6 pb-2 mx-9">
      <HeaderTopBanner />
      <HeaderMiddleBar />
      <HeaderBottomBar />
    </header>
  );
}
