import Image from 'next/image';
import HeaderActions from '@/components/header/common/header-actions';
import HeaderSearch from '@/components/header/common/header-search';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Link } from '@/i18n/navigation';

export default function HeaderMiddleBar() {
  const isExtraLargeScreen = useBreakpoint('xl');

  return (
    <div className="flex justify-between items-center self-stretch w-full pt-6">
      <div className="min-w-[223px]">
        <Link href="/">
          <Image src="/images/logo.svg" alt="Logo" width="148" height="24" />
        </Link>
      </div>
      <HeaderSearch small={!isExtraLargeScreen} />
      <HeaderActions />
    </div>
  );
}
