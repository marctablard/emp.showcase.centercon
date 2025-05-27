'use client';

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


export default function Header() {
  const t = useTranslations('header');
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
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink>Link</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
                <NavigationMenuLink href="/product/10637590" className="no-underline px-4">
                  {t('featuredProduct')}
                </NavigationMenuLink>
                <NavigationMenuLink className="no-underline px-4">
                  Components
                </NavigationMenuLink>
                <NavigationMenuLink className="no-underline px-4">
                  Components
                </NavigationMenuLink>
                <NavigationMenuLink className="no-underline px-4">
                  Components
                </NavigationMenuLink>
              </NavigationMenu>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button className="py-4" variant="outline">
                <Link href="/login">{t('signIn')}</Link>
              </Button>
              <Button className="py-4" variant="default">
                <Link href="/register"> {t('register')}</Link>
              </Button>
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
