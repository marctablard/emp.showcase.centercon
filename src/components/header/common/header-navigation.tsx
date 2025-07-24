import { useTranslations } from 'next-intl';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export function HeaderNavigation() {
  const t = useTranslations('layout.header');

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t('allProducts')}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/product/victron-bluesolar-55w">Bluesolar 55W</NavigationMenuLink>
            <NavigationMenuLink href="/product/enjoysolar-200w-module">Enjoysolar 200W Module</NavigationMenuLink>
            <NavigationMenuLink href="/product/ecoflow-extension-cable">EcoFlow Extension Cable</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/services" className={navigationMenuTriggerStyle()}>
            {t('services')}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/solutions" className={navigationMenuTriggerStyle()}>
            {t('solutions')}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/online-planer" className={navigationMenuTriggerStyle()}>
            {t('onlinePlaner')}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/about-us" className={navigationMenuTriggerStyle()}>
            {t('aboutUs')}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
