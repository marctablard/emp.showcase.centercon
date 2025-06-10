import { CartOverview } from '@/components/cart/cart-overview';
import { getCurrentCart } from '@/lib/ssr/carts';

export default async function CartPage() {
  const cart = await getCurrentCart();

  return <CartOverview initialCart={cart} />;
}
