'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Coins, Minus, Package, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UINotification } from '@/components/ui/molecules/ui-notification';
import { useCart } from '@/hooks/cart/useCart';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useAvailability } from '@/hooks/product/useAvailability';
import { useL10n } from '@/hooks/useL10n';
import { cn, formatCurrency } from '@/lib/utils';
import { Cart, CartItem, CartItemPriceChange, CartItemSubstitution } from '@/platform/services/model/cart/cart.d';
import { StorefrontNotification } from '@/platform/services/model/notification/notification';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { SubstitutionModal } from './substitution-modal';

interface CartItemProps {
  cart: Cart;
  item: CartItem;
  showQty?: boolean;
}

export function CartItemRow({ cart, item, showQty }: CartItemProps) {
  const { l10n } = useL10n();
  const t = useTranslations('cart');
  const { updateItemQuantity, removeItem, loading } = useCart(cart);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const isStrike = false;
  const { registerNotificationListener, unregisterNotificationListener, markNotificationAsRead } = useNotifications();
  const [substitution, setSubstitution] = useState<CartItemSubstitution | null>(null);
  const [substitutionNotificationId, setSubstitutionNotificationId] = useState<string | null>(null);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [priceChange, setPriceChange] = useState<CartItemPriceChange | null>(null);
  const { availability } = useAvailability(item.product?.id);

  // Handler for cart notifications
  const handleCartNotification = useCallback(
    (notification: StorefrontNotification | string) => {
      if (typeof notification === 'string') {
        if (notification === substitutionNotificationId) {
          setShowSubstitutionModal(false);
          setSubstitutionNotificationId(null);
          setSubstitution(null);
        }
        return;
      }
      if (notification.code === 'SUBSTITUTION_AVAILABLE') {
        const substitution = notification.data_json as CartItemSubstitution;
        console.log('ITEM: Substitution available:', substitution);
        if (substitution.productId === item.product?.id) {
          console.log('ITEM: Substitution available:', substitution);
          setSubstitution(substitution);
          setSubstitutionNotificationId(notification.id);
        }
      } else if (notification.code === 'ITEM_PRICE_CHANGE') {
        const priceChange = notification.data_json as CartItemPriceChange;
        if (priceChange.productId === item.product?.id) {
          console.log('ITEM: Price change detected:', priceChange);
          setPriceChange(priceChange);
        }
      }
      return false;
    },
    [item.product?.id, substitutionNotificationId],
  );

  // Register for cart notifications on mount
  useEffect(() => {
    const subscriptionId = registerNotificationListener('CART', handleCartNotification);
    return () => {
      unregisterNotificationListener(subscriptionId);
    };
  }, [handleCartNotification, registerNotificationListener, unregisterNotificationListener, item.product?.id, cart.id]);

  useEffect(() => {
    if (item.quantity != quantity) {
      setQuantity(item.quantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.quantity]);

  // Handle quantity update
  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || isProcessing) return;
    setIsProcessing(true);
    try {
      setQuantity(newQuantity);
      updateItemQuantity(item.id, newQuantity);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle item removal
  const handleRemoveItem = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      setQuantity(0);
      removeItem(item.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const onChangeQty = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(e.target.value));
    setTimeout(() => {
      handleUpdateQuantity(parseInt(e.target.value));
    }, 500);
  };

  const onSubstitutionDone = () => {
    if (substitutionNotificationId) {
      markNotificationAsRead(substitutionNotificationId);
      setSubstitutionNotificationId(null);
      setSubstitution(null);
    }
    setShowSubstitutionModal(false);
  };

  return (
    <div className="py-6 first:border-none border-t border-neutral-200 md:first:border-solid">
      <div className="grid grid-cols-[1fr_2fr] sm:grid-cols-[120px_3fr] md:grid-cols-[120px_3fr_1fr_1fr] lg:grid-cols-[120px_2fr_2fr_1fr] xl:grid-cols-[120px_3fr_1.5fr_2fr] 2xl:grid-cols-[120px_4fr_1fr_1fr]">
        <div className="col-start-1 row-start-2  md:row-start-1 row-end-3">
          <div className="rounded-ss-xl rounded-ee-xl w-[100px] h-[65px] sm:w-[120px] sm:h-[78px] object-fit overflow-hidden">
            {item.product && item.product.images?.length ? (
              <Image
                width={100}
                height={65}
                src={String(item.product.images[0].url)}
                alt={String(item.product.name || 'Product')}
                className="rounded-ss-xl-[inherit] rounded-ee-xl-[inherit] w-[100px] h-[65px] sm:w-[120px] sm:h-[78px]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-8 w-8 opacity-30" />
              </div>
            )}
          </div>
        </div>
        <div className="col-start-1 col-end-3 row-start-1 md:col-start-2 flex flex-col gap-1 mb-4 md:mb-0 md:mx-4">
          <p className="text-sm md:text-base">Allen Key Type</p>
          <p
            className="font-bold text-base font-headlines cursor-pointer"
            onClick={() => router.push(`/product/${item.product?.id}`)}
          >
            {l10n(item.product?.name || 'Product')}
          </p>
        </div>
        <div
          className={cn(
            'row-start-3 col-start-2 md:col-end-2 flex flex-col gap-2 md:row-start-2 mx-4 pt-2',
            !isStrike && showQty && '-mt-4 sm:-mt-6 md:-mt-0',
          )}
        >
          {!showQty ? (
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <p className="text-xs md:border-r border-neutral-200 md:pr-4">
                {t('itemNumber')}: {item.product?.id}
              </p>
              <p className="text-xs md:pl-4">
                {t('qty')}: {item.quantity}
              </p>
            </div>
          ) : (
            <p className="text-xs">
              {t('itemNumber')}: {item.product?.id}
            </p>
          )}
          <div className="flex items-center gap-1">
            {availability ? (
              availability.availableQuantity >= item.quantity ? (
                // Fully available
                <>
                  <div className="text-success-500">
                    <Package className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-success-500">{t('available')}</p>
                </>
              ) : availability.availableQuantity > 0 ? (
                // Partially available
                <>
                  <div className="text-warning-500">
                    <Package className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-warning-500">
                    {t('substitution.availableDescription', {
                      available: availability.availableQuantity,
                      total: item.quantity,
                    })}
                  </p>
                </>
              ) : availability.availableInDays ? (
                // Available in X days
                <>
                  <div className="text-warning-500">
                    <Package className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-warning-500">
                    {t('substitution.availableInDays', { days: availability.availableInDays })}
                  </p>
                </>
              ) : (
                // Not available
                <>
                  <div className="text-error-500">
                    <Package className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-error-500">
                    {t('substitution.availableDescription', { available: 0, total: item.quantity })}
                  </p>
                </>
              )
            ) : (
              // Loading or no availability data
              <>
                <div className="text-success-500">
                  <Package className="h-4 w-4" />
                </div>
                <p className="text-sm text-success-500">{t('available')}</p>
              </>
            )}
          </div>
          {showQty && (
            <Button variant="link" size="small" className="normal-case text-sm tracking-normal p-0 justify-start">
              {t('addToWishlist')}
            </Button>
          )}
        </div>
        {showQty && (
          <div className="col-start-2 row-start-4 md:col-start-3 md:col-end-3 md:row-start-1 lg:col-start-3 flex gap-4 ms-4 mt-4 md:ms-0 md:mt-0">
            <div className="w-full flex">
              {quantity <= 1 ? (
                <Button
                  variant="secondary"
                  size="icon"
                  className="p-3 h-13 border-neutral-300 rounded-none rounded-ss-sm rounded-es-sm"
                  disabled={loading}
                  onClick={handleRemoveItem}
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="icon"
                  className="p-3 h-13 border-neutral-300 rounded-none rounded-ss-sm rounded-es-sm"
                  disabled={loading}
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                >
                  <Minus className="h-6 w-6" />
                </Button>
              )}
              <div className="w-15 h-13 border-y border-neutral-300">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Spinner color="primary" variant="sm" />
                  </div>
                ) : (
                  <div className="relative">
                    <Input value={quantity} className="py-3 text-center border-none" onChange={(e) => onChangeQty(e)} />
                    {substitution && (
                      <div className="cursor-pointer" onClick={() => setShowSubstitutionModal(true)}>
                        <UINotification icon={Package} iconSize={24} animate="pulse" className="absolute" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="p-3 h-13 border-neutral-300 rounded-none rounded-ee-sm rounded-se-sm"
                disabled={loading}
                onClick={() => handleUpdateQuantity(quantity + 1)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
        <div className="col-start-2 row-start-2 md:col-start-4 md:row-start-1 md:row-end-3 lg:col-start-4 flex flex-col gap-1 ps-4 md:ps-0">
          {item.price.originalAmount && item.price.originalAmount !== item.price.amount && (
            <p className="line-through md:text-end text-danger-500">
              {formatCurrency(item.price.originalAmount, item.price.currency)}
            </p>
          )}
          <div className="font-bold md:text-end relative">
            {formatCurrency(item.tax?.netValue || item.price.amount, item.price.currency)}
            {priceChange && (
              <div className="cursor-pointer">
                <UINotification
                  icon={Coins}
                  iconSize={18}
                  className="bottom-[-38px] right-[-12px] absolute"
                  animate="pulse"
                />
              </div>
            )}
          </div>
          {item.tax?.netValue && (
            <span className="text-xs text-neutral-300 md:text-end">
              {t('gross')}
              {formatCurrency(item.tax?.grossValue, item.price.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Substitution Modal */}
      {showSubstitutionModal && substitution && (
        <SubstitutionModal
          isOpen={showSubstitutionModal}
          onClose={() => setShowSubstitutionModal(false)}
          cartItem={item}
          substitution={substitution}
          onDone={onSubstitutionDone}
        />
      )}
    </div>
  );
}
