import { HeaderBottomBar } from '@/components/header/expanded/header-bottom-bar';
import { HeaderMiddleBar } from '@/components/header/expanded/header-middle-bar';
import { HeaderTopBanner } from '@/components/header/expanded/header-top-banner';
import { HeaderCompact } from '@/components/header/header-compact';
import { SearchInputProps } from '@/hooks/search/useSearchInput';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function HeaderExpanded(props: SearchInputProps) {
  const isAboveMediumScreen = useBreakpoint('md');

  return (
    <>
      <HeaderTopBanner />

      {isAboveMediumScreen ? (
        /* Desktop */
        <div className="px-6 pb-2 group">
          <HeaderMiddleBar {...props} />
          <HeaderBottomBar />
        </div>
      ) : (
        /* Tablet */
        <div className="pt-6">
          <HeaderCompact {...props} />
        </div>
      )}
    </>
  );
}
