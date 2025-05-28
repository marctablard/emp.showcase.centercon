import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu"
import { Menu } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import HeaderAccount from './header-account';

export default async function Header() {

  const t = await getTranslations('header');
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-12">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-xl text-gray-800">
              Emporix Showcase
            </Link>
          </div>
          <div className="overflow-hidden flex items-center gap-10">
            <div className="hidden md:flex items-center">
              <NavigationMenu className="flex gap-4 no-underline">
                <NavigationMenuLink href="/product/10637590" className="no-underline px-4">
                  {t('featuredProduct')}
                </NavigationMenuLink>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink>Link</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <HeaderAccount />
            </div>
            <Button className="md:hidden flex py-4 bg-white text-primary" size="icon">
              <Menu />
            </Button>
          </div>
          
        </div>
      </div>
    </header>
  );
}
