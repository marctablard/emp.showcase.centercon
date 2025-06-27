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

export default function HeaderNavigation() {
  const t = useTranslations('header');

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
          <NavigationMenuLink href="/services">{t('services')}</NavigationMenuLink>
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
  );
}
