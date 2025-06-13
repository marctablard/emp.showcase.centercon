import { getTranslations } from 'next-intl/server';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export default async function HeaderBottomBar() {
  const t = await getTranslations('header');

  return (
    <div className="flex justify-between pt-3">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{t('allProducts')}</NavigationMenuTrigger>
            <NavigationMenuContent></NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{t('services')}</NavigationMenuTrigger>
            <NavigationMenuContent></NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{t('solutions')}</NavigationMenuTrigger>
            <NavigationMenuContent></NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/#" className={navigationMenuTriggerStyle()}>
              {t('onlinePlaner')}
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/#" className={navigationMenuTriggerStyle()}>
              {t('aboutUs')}
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Button className="pl-4 pr-1 py-1 gap-4">
        <span>0,00 €</span>
        <div className="flex items-center w-[43px] h-[35px] relative">
          <Badge variant="white" className="h-5 min-w-5 rounded-full px-1 tabular-nums absolute top-0 right-0">
            15
          </Badge>
          <ShoppingCart width="32" height="32" />
        </div>
      </Button>
    </div>
  );
}
