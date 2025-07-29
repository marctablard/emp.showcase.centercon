import { HeaderCartButton } from '@/components/header/common/cart/header-cart-button';
import { HeaderNavigation } from '@/components/header/common/header-navigation';

export function HeaderBottomBar() {
  return (
    <div className="flex justify-between pt-3 group-has-[.search]:hidden">
      <HeaderNavigation />
      <HeaderCartButton />
    </div>
  );
}
