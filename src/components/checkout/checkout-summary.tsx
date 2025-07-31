'use client';

import React, { RefObject, useEffect, useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { LockKeyhole } from 'lucide-react';
import { useApprovalCheckout } from '@/hooks/approval/useApprovalCheckout';
import { useCartTotal } from '@/hooks/cart/useCartTotal';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useElementScroll } from '@/hooks/ui/useElementScroll';
import { useValidator } from '@/hooks/validation/useValidator';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { FormControl, FormField, FormItem } from '../ui/form';
import { H2 } from '../ui/h';
import { ApprovalModal } from './approval-modal';

interface OrderSummaryProps {
  isReadOnly?: boolean;
  leftContent: RefObject<HTMLDivElement | null>;
  onSubmit: (approvalData?: { approverId: string; comment: string }) => void;
}

/**
 * Order summary component for checkout
 * Displays cart items, subtotal, shipping, and total
 */
const CheckoutSummaryComponent: React.FC<OrderSummaryProps> = ({ leftContent, onSubmit }) => {
  const { checkoutCart: cart, loading: checkoutLoading } = useCheckout();
  const { requiresApproval, loading: approvalLoading, setCartId } = useApprovalCheckout(cart?.id?.toString());
  const loading = checkoutLoading || approvalLoading;
  const t = useTranslations('checkout.summary');
  const [isSubmitting] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const onValidationSuccess = (data: any) => {
    setDisabled(!data.termsAndConditions);
  };

  const approvalSubmit = (approverId: string, comment: string) => {
    onSubmit({ approverId, comment });
    setIsApprovalModalOpen(false);
  };

  useEffect(() => {
    if (cart) {
      setCartId(cart.id);
    }
  }, [cart, setCartId]);

  const { form } = useValidator(
    'SummaryValidationService',
    {
      termsAndConditions: false,
    },
    'onChange',
    onValidationSuccess,
  );

  const fixedContainer = useRef<HTMLDivElement>(null);
  const { isFixed, isFixedToTop, isContainerBottom } = useElementScroll(fixedContainer, 80, leftContent);
  const { cartTotal, shippingCosts } = useCartTotal();
  if (!cart) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">{t('title')}</h2>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', isContainerBottom ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex flex-col gap-4',
          isFixed ? 'fixed lg:me-9' : '',
          isFixedToTop ? 'top-[112px]' : 'bottom-[40px]',
        )}
        ref={fixedContainer}
      >
        <Card
          className={cn('bg-primary-50 p-6 border-none gap-4 shadow-footer lg:max-w-[438px] w-full')}
          ref={fixedContainer}
        >
          <CardHeader className="p-0">
            <CardTitle>
              <H2 variant="h5" className="text-3xl font-bold">
                {t('title')}
              </H2>
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white rounded-md p-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="">{t('valueOfGoods')}</span>
                <span>{formatCurrency(cart?.subTotalPrice.amount, cart?.subTotalPrice.currency)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-4 border-t border-neutral-200">
                <span>{t('netValueOfGoods')}</span>
                <span className="font-bold">{formatCurrency(cart.tax.netValue, cart.tax.currency)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-medium text-base">
                  <span>{t('vat')}</span>
                  <span>{formatCurrency(cart?.tax?.amount, cart?.tax?.currency)}</span>
                </div>
                <div className="flex justify-between font-medium text-base">
                  <span>{t('shippingCosts')}</span>
                  {shippingCosts !== undefined ? (
                    <span>{formatCurrency(shippingCosts, cart.currency)}</span>
                  ) : (
                    <span>{t('calculatedAtCheckout')}</span>
                  )}
                </div>
                {cart.fees && (
                  <div className="flex justify-between font-medium text-base">
                    <span>{t('fees')}</span>
                    <span>{formatCurrency(cart.fees.amount, cart.fees.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl">
                  <span>{t('total')}</span>
                  <span>{formatCurrency(cartTotal, cart.currency)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col p-0">
            <FormProvider {...form}>
              <FormField
                control={form.control}
                name="termsAndConditions"
                render={({ field }) => (
                  <FormItem className="flex flex-row gap-4">
                    <FormControl>
                      <Checkbox
                        id="termsAndConditions"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-white"
                      />
                    </FormControl>
                    <p className="w-full pb-4">{t('termsAndConditions')}</p>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                onClick={(e) => {
                  if (requiresApproval) {
                    e.preventDefault();
                    setIsApprovalModalOpen(true);
                  } else {
                    onSubmit();
                  }
                }}
                disabled={disabled || isSubmitting || loading || approvalLoading}
                className="w-full"
              >
                {isSubmitting || loading
                  ? t('processing')
                  : requiresApproval
                    ? t('inquireForApproval')
                    : t('submitOrder')}
              </Button>
            </FormProvider>
            <div className="flex align-center gap-2 text-neutral-600 pt-4">
              <div>
                <LockKeyhole width={12} />
              </div>
              <div className="text-xs">{t('dataTransmittedSecure')}</div>
            </div>

            {/* Approval Modal */}
            {cart && (
              <ApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                cartId={cart.id}
                approvalSubmit={approvalSubmit}
              />
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSummaryComponent;
