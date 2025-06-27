import Image from 'next/image';
import HeaderActions from '@/components/header/common/header-actions';
import HeaderSearch from '@/components/header/common/search/header-search';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Link } from '@/i18n/navigation';

export default function HeaderMiddleBar() {
  const isExtraLargeScreen = useBreakpoint('xl');

  return (
    <div
      className={`flex self-stretch w-full pt-6 items-center justify-between has-[.search]:[&_.hide-on-focus]:opacity-0 has-[.search]:[&_.hide-on-focus]:w-0`}
    >
      <div className="transition-all duration-300 hide-on-focus">
        <Link href="/">
          <Image src="/images/logo.svg" alt="Logo" width="148" height="24" />
        </Link>
      </div>

      <HeaderSearch small={!isExtraLargeScreen} />
      <HeaderActions className="transition-all duration-300 hide-on-focus" />
    </div>
  );
}
