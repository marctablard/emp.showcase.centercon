import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Euro, Gauge, Globe, Languages, Pin, User } from 'lucide-react';
import LogoIcon from '@/assets/logo.svg';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default async function Header() {
  const t = await getTranslations('header');
  return (
    <header className="bg-white opacity-95 shadow-xl rounded-2xl px-6 pb-2 pt-0 mx-9 mt-4">
      <div className="bg-primary text-white shadow-sm rounded-2xl flex items-center -mx-10 -mt-1 h-8 px-10">
        <div className="flex justify-between items-center self-stretch w-full">
          <div className="flex grow basis-0 shrink-0 items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <p className="text-sm pt-[2px]">Germany</p>
            </div>
            <div className="h-6">
              <Separator orientation="vertical" decorative />
            </div>
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              <p className="text-sm pt-[2px]">English</p>
            </div>
            <div className="h-6">
              <Separator orientation="vertical" decorative />
            </div>
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              <p className="text-sm pt-[2px]">Euro</p>
            </div>
          </div>
          <div className="flex justify-center items-center">Here is space for you top banner announcements</div>
          <div className="flex grow basis-0 shrink-0 justify-end items-center gap-6">
            {/* Todo: Links are missing */}
            <Link href="/blog">Blog</Link>
            <Link href="/newsletter">Newsletter</Link>
            <Link href="/offer-request">Offer Request</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center self-stretch w-full pt-6">
        <div>
          <Link href="/">
            <Image src={LogoIcon.src} alt="Logo" width={LogoIcon.width} height={LogoIcon.height} />
          </Link>
        </div>
        <div>
          <Input placeholder={t('search')} />
        </div>
        <div className="flex justify-end items-center gap-6">
          <div className="flex flex-col items-center min-w-12 max-w-[90px]">
            <User className="w-8 h-8 text-primary" />
            <p className="text-sm text-primary font-bold -mt-1">Login</p>
          </div>
          <div className="flex flex-col items-center min-w-12 max-w-[90px]">
            <Gauge className="w-8 h-8 text-primary" />
            <p className="text-sm text-primary font-bold -mt-1">Quick Order</p>
          </div>
          <div className="flex flex-col items-center min-w-12 max-w-[90px]">
            <Pin className="w-8 h-8 text-primary" />
            <p className="text-sm text-primary font-bold -mt-1">Whishlists</p>
          </div>
        </div>
      </div>
    </header>

    // <header className="bg-white shadow-md">
    //   <div className="max-w-6xl mx-auto px-12">
    //     <div className="flex justify-between h-16">
    //       <div className="flex-shrink-0 flex items-center">
    //         <Link href="/" className="font-bold text-xl text-neutral-800">
    //           Emporix Showcase
    //         </Link>
    //       </div>
    //       <div className="overflow-hidden flex items-center gap-10">
    //         <div className="hidden md:flex items-center">
    //           <NavigationMenu className="flex gap-4 no-underline">
    //             <NavigationMenuLink href="/product/10637590" className="no-underline px-4">
    //               {t('featuredProduct')}
    //             </NavigationMenuLink>
    //             <NavigationMenuList>
    //               <NavigationMenuItem>
    //                 <NavigationMenuTrigger>Components</NavigationMenuTrigger>
    //                 <NavigationMenuContent>
    //                   <NavigationMenuLink>Link</NavigationMenuLink>
    //                 </NavigationMenuContent>
    //               </NavigationMenuItem>
    //             </NavigationMenuList>
    //           </NavigationMenu>
    //         </div>
    //         <div className="hidden md:flex items-center gap-2">
    //           <HeaderAccount />
    //         </div>
    //         <Button className="md:hidden flex py-4" variant="primary" size="icon">
    //           <Menu />
    //         </Button>
    //       </div>
    //     </div>
    //   </div>
    // </header>
  );
}
