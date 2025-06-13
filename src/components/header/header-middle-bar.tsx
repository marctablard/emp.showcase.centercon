import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Gauge, Pin, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
      <div className="w-full max-w-[700px]">
        <Input placeholder={t('search')} />
      </div>
      <div className="flex justify-end items-center gap-6">
        <Link href="/login" className="flex flex-col items-center min-w-12 max-w-[90px]">
          <User className="w-8 h-8 text-primary" />
          <p className="text-sm text-primary font-bold -mt-1">Login</p>
        </Link>
        <Link href="/#" className="flex flex-col items-center min-w-12 max-w-[90px]">
          <Gauge className="w-8 h-8 text-primary" />
          <p className="text-sm text-primary font-bold -mt-1">Quick Order</p>
        </Link>
        <Link href="/#" className="flex flex-col items-center min-w-12 max-w-[90px]">
          <Pin className="w-8 h-8 text-primary" />
          <p className="text-sm text-primary font-bold -mt-1">Wishlists</p>
        </Link>
      </div>
    </div>
  );
}
