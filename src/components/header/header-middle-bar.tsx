import Image from 'next/image';
import HeaderActions from '@/components/header/header-actions';
import HeaderSearch from '@/components/header/header-search';
import { Link } from '@/i18n/navigation';

export default function HeaderMiddleBar() {
  return (
    <div className="flex justify-between items-center self-stretch w-full pt-6">
      <div className="min-w-[223px]">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width="148" height="24" />
        </Link>
      </div>
      <HeaderSearch small={false} />
      <HeaderActions />
    </div>
  );
}
