'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { format } from 'date-fns';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from '@/i18n/navigation';
import { CreateReturnItem, createReturn } from '@/lib/client/returns';
import { formatCurrency } from '@/lib/utils';
import { Order, OrderItem } from '@/platform/services/model/order/order';

interface CreateReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

interface ItemQuantity {
  [itemId: string]: number;
}

/**
 * Dialog for creating a return request for an order
 * Displays order details and allows selecting quantities to return
 */
export function CreateReturnDialog({ open, onOpenChange, order }: CreateReturnDialogProps) {
  const t = useTranslations('account.returns.createDialog');
  const tReturns = useTranslations('account.returns');
  const router = useRouter();
  const [quantities, setQuantities] = useState<ItemQuantity>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSelectedItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const getItemImage = (item: OrderItem): string => {
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    return '/images/placeholder.png';
  };

  const updateQuantity = (itemId: string, newQty: number, maxQty: number): void => {
    const clampedQty = Math.max(0, Math.min(newQty, maxQty));
    setQuantities((prev) => ({
      ...prev,
      [itemId]: clampedQty,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const items: CreateReturnItem[] = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([id, quantity]) => ({ id, quantity }));

      if (items.length === 0) {
        setError(t('noItemsSelected'));
        setLoading(false);
        return;
      }

      const response = await createReturn(order.id, items);

      onOpenChange(false);
      router.push(`/account/returns/${response.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitError'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean): void => {
    if (!newOpen) {
      setQuantities({});
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-[736px] lg:max-w-[1106px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold">{t('title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('description')}</DialogDescription>
        </DialogHeader>

        {/* Order Details */}
        <div className="flex gap-6 md:gap-8 py-4 border-b border-border-primary">
          <div>
            <p className="text-sm font-semibold text-text-body">{t('orderNumber')}</p>
            <p className="font-normal">{order.id}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-body">{t('deliveryDate')}</p>
            <p className="font-normal">{formatDate(order.lastStatusChange)}</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="py-4 w-full min-w-0">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-[1fr_154px_100px] gap-4 pb-4 text-sm font-medium text-text-on-disabled">
            <div>{tReturns('productDetails')}</div>
            <div>{tReturns('quantity')}</div>
            <div className="text-right">{tReturns('unitPrice')}</div>
          </div>

          {/* Table Body */}
          <div className="space-y-4 w-full min-w-0">
            {order.items.map((item) => {
              const currentQty = quantities[item.id] || 0;
              const maxQty = item.quantity;

              return (
                <div key={item.id} className="py-4 border-b border-border-secondary w-full min-w-0">
                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-[1fr_154px_100px] gap-4 items-start">
                    {/* Product Info */}
                    <div className="flex gap-4">
                      <div className="w-20 h-13 relative flex-shrink-0 bg-surface-image-background rounded">
                        <Image src={getItemImage(item)} alt={item.name || ''} fill className="object-contain p-1" />
                      </div>
                      <div className="flex flex-col gap-1">
                        {item.sku && <span className="text-sm text-text-on-disabled">{item.sku}</span>}
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-text-on-disabled">
                          {t('itemNumber')}: {item.productId || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center">
                      <div className="flex border border-border-primary rounded overflow-hidden">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-12 w-12 rounded-none border-none"
                          onClick={() => updateQuantity(item.id, currentQty - 1, maxQty)}
                          disabled={currentQty <= 0 || loading}
                          aria-label={t('decrease')}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-15 h-12 flex items-center justify-center border-x border-border-primary bg-surface-page">
                          <span className="font-medium">{currentQty}</span>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-12 w-12 rounded-none border-none"
                          onClick={() => updateQuantity(item.id, currentQty + 1, maxQty)}
                          disabled={currentQty >= maxQty || loading}
                          aria-label={t('increase')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="text-right">
                      {item.price ? (
                        <>
                          <p className="font-medium">{formatCurrency(item.price.value, item.price.currency)}</p>
                          {item.price.originalValue && item.price.originalValue !== item.price.value && (
                            <p className="text-sm text-text-on-disabled line-through">
                              {formatCurrency(item.price.originalValue, item.price.currency)}
                            </p>
                          )}
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout - Card style */}
                  <div className="flex flex-col gap-4 md:hidden w-full min-w-0">
                    {/* Brand and Name */}
                    <div className="flex flex-col gap-1">
                      {item.sku && <span className="text-xs text-text-body">{item.sku}</span>}
                      <span className="text-sm font-bold text-text-headings">{item.name}</span>
                    </div>

                    {/* Image and Details Row */}
                    <div className="flex gap-4 w-full min-w-0">
                      {/* Product Image */}
                      <div className="w-[100px] h-[65px] relative flex-shrink-0 bg-surface-image-background rounded-tl-lg rounded-br-lg">
                        <Image src={getItemImage(item)} alt={item.name || ''} fill className="object-contain p-2" />
                      </div>

                      {/* Price and Details */}
                      <div className="flex flex-col gap-3 flex-1 min-w-0">
                        {/* Price */}
                        <div className="flex flex-col gap-1">
                          {item.price ? (
                            <>
                              <p className="text-sm font-bold text-text-headings">
                                {formatCurrency(item.price.value, item.price.currency)}
                              </p>
                              {item.price.originalValue && item.price.originalValue !== item.price.value && (
                                <p className="text-xs text-text-on-disabled">
                                  Net {formatCurrency(item.price.originalValue, item.price.currency)}
                                </p>
                              )}
                            </>
                          ) : (
                            <span>-</span>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-text-body truncate">
                            {t('itemNumber')}: {item.productId || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper - Full width row */}
                    <div className="grid grid-cols-[48px_1fr_48px] border border-border-primary rounded w-full">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-12 w-full rounded-l rounded-r-none border-none"
                        onClick={() => updateQuantity(item.id, currentQty - 1, maxQty)}
                        disabled={currentQty <= 0 || loading}
                        aria-label={t('decrease')}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="h-12 flex items-center justify-center border-x border-border-primary bg-surface-page">
                        <span className="font-medium">{currentQty}</span>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-12 w-full rounded-r rounded-l-none border-none"
                        onClick={() => updateQuantity(item.id, currentQty + 1, maxQty)}
                        disabled={currentQty >= maxQty || loading}
                        aria-label={t('increase')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="p-4 bg-surface-error-soft rounded text-text-error text-sm">{error}</div>}

        {/* Footer */}
        <DialogFooter className="flex flex-row gap-6 pt-4">
          <DialogClose asChild>
            <Button variant="secondary" size="default" disabled={loading}>
              {tReturns('cancel')}
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            size="default"
            onClick={handleSubmit}
            disabled={totalSelectedItems === 0 || loading}
          >
            {loading ? t('submitting') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
