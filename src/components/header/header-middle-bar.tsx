import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Gauge, Pin, User } from 'lucide-react';
import HeaderIconLink from '@/components/header/header-icon-link';
import HeaderSearch from '@/components/header/header-search';
import { Link } from '@/i18n/navigation';

export default async function HeaderMiddleBar() {
  const t = await getTranslations('header');

  return (
    <div className="flex justify-between items-center self-stretch w-full pt-6">
      <div className="min-w-[223px]">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width="148" height="24" />
        </Link>
      </div>
      <HeaderSearch />
      <div className="flex justify-end items-center gap-6">
        <HeaderIconLink icon={User} text="Login" href="/login" />
        <HeaderIconLink icon={Gauge} text="Quick Order" href="/#" />
        <HeaderIconLink icon={Pin} text="Wishlists" href="/#" />
      </div>
    </div>
  );
}
