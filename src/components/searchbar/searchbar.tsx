import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu"
import { Input } from "@/components/ui/input"
import MiniCart from '@/components/cart/mini-cart';
import { getCurrentCart } from "@/lib/ssr/carts";
import { getTranslations } from "next-intl/server";

export default async function Searchbar() {
  // TODO move initial fetch of cart to a more appropriate Place
  const cart = await getCurrentCart();
  const t = await getTranslations('searchBar');
  return (
    <div className="bg-primary py-8">
      <div className="max-w-7xl mx-auto px-12">
        <div className="flex justify-between overflow-hidden">
          <div className="flex-shrink-0 flex items-center gap-10">
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-primary text-white">{t('allProducts')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink>Link</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex-shrink-0 flex items-center">
              <Input className="bg-white w-90" placeholder={t('search')}></Input>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-8 text-white">
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-primary">{t('bulkOrder')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink>Link</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <MiniCart initialCart={cart || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
