import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UiLink from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { useCart } from '@/hooks/cart/useCart';
import { formatCurrency } from '@/lib/utils';

export default function HeaderCartButton() {
  const { cart, loading } = useCart();

  return (
    <UiLink
      href="/cart"
      type="Link"
      variant="secondary"
      className="text-primary-foreground bg-primary px-2 py-1 gap-4 self-center rounded-sm relative"
    >
      <span className="text-white font-bold">
        {loading || !cart ? '' : formatCurrency(cart?.totalPrice.amount || 0, cart?.totalPrice.currency || 'EUR')}
      </span>
      <ShoppingCart color="white" width="32" height="32" />
      <Badge variant="white" className="h-5 min-w-5 rounded-full px-1 tabular-nums absolute top-1 right-1">
        {loading || !cart ? <Spinner color="primary" variant="xs" /> : cart?.items.length || 0}
      </Badge>
    </UiLink>
  );
}
