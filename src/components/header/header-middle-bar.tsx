import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Gauge, Pin, User } from 'lucide-react';
import LogoIcon from '@/assets/logo.svg';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';

export default async function HeaderMiddleBar() {
  const t = await getTranslations('header');

  return (
    <div className="flex justify-between items-center self-stretch w-full pt-6">
      <div className="min-w-[223px]">
        <Link href="/">
          <Image src={LogoIcon.src} alt="Logo" width={LogoIcon.width} height={LogoIcon.height} />
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
          <p className="text-sm text-primary font-bold -mt-1">Whishlists</p>
        </Link>
      </div>
    </div>
  );
}
