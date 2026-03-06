'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { type ItemQuantity, ReturnItemSelector } from '@/components/account/returns/return-item-selector';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from '@/i18n/navigation';
import { CreateReturnItem, RETURN_REASON_CODES, ReturnReasonCode, createReturn } from '@/lib/client/returns';
import { type OrderReturnability, buildRemainingQuantityMap } from '@/lib/common/returns/returnability';
import { Order } from '@/platform/services/model/order/order';

interface CreateReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  returnability?: OrderReturnability;
}

/**
 * Dialog for creating a return request for an order
 * Displays order details and allows selecting quantities to return
 */
export function CreateReturnDialog({ open, onOpenChange, order, returnability }: CreateReturnDialogProps) {
  const t = useTranslations('account.returns.createDialog');
  const tReturns = useTranslations('account.returns');
  const router = useRouter();
  const [quantities, setQuantities] = useState<ItemQuantity>({});
  const [reasonCode, setReasonCode] = useState<ReturnReasonCode | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingMap = returnability ? buildRemainingQuantityMap(returnability) : null;
  const returnableItems = remainingMap
    ? order.items.filter((item) => (remainingMap.get(item.id) ?? item.quantity) > 0)
    : order.items;

  const totalSelectedItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMMM d, yyyy');
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

      if (!reasonCode) {
        setError(t('reasonRequired'));
        setLoading(false);
        return;
      }

      const response = await createReturn(order.id, items, reasonCode);

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
      setReasonCode('');
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

        <ReturnItemSelector
          items={returnableItems}
          quantities={quantities}
          onUpdateQuantity={updateQuantity}
          loading={loading}
          remainingQuantityMap={remainingMap ?? undefined}
        />

        {/* Return Reason */}
        <div className="py-4 border-b border-border-primary">
          <label className="block text-sm font-semibold text-text-body mb-2">
            {t('returnReason')} <span className="text-text-error">*</span>
          </label>
          <Select
            value={reasonCode}
            onValueChange={(value: string) => setReasonCode(value as ReturnReasonCode)}
            disabled={loading}
          >
            <SelectTrigger className="w-full" data-testid="return-reasonSelect">
              <SelectValue placeholder={t('selectReason')} />
            </SelectTrigger>
            <SelectContent>
              {RETURN_REASON_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {t(`reasons.${code}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error Message */}
        {error && <div className="p-4 bg-surface-error-soft rounded text-text-error text-sm">{error}</div>}

        {/* Footer */}
        <DialogFooter className="flex flex-row gap-6 pt-4">
          <DialogClose asChild>
            <Button variant="secondary" size="default" disabled={loading} data-testid="return-cancelButton">
              {tReturns('cancel')}
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            size="default"
            onClick={handleSubmit}
            disabled={totalSelectedItems === 0 || !reasonCode || loading}
            data-testid="return-submitButton"
          >
            {loading ? t('submitting') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
