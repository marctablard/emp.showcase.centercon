import HeaderBottomBar from '@/components/header/expanded/header-bottom-bar';
import HeaderMiddleBar from '@/components/header/expanded/header-middle-bar';
import HeaderTopBanner from '@/components/header/expanded/header-top-banner';

export default function HeaderExpanded() {
  return (
    <>
      <HeaderTopBanner />
      <div className="px-6 pb-2">
        <HeaderMiddleBar />
        <HeaderBottomBar />
      </div>
    </>
  );
}
