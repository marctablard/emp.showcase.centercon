import HeaderCartButton from '@/components/header/common/header-cart-button';
import HeaderNavigation from '@/components/header/common/header-navigation';

export default function HeaderBottomBar() {
  return (
    <div className="flex justify-between pt-3">
      <HeaderNavigation />
      <HeaderCartButton />
    </div>
  );
}
