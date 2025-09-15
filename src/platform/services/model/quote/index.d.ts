import { EmporixAddress } from '@/platform/integrations/emporix/model';
import type { EmporixCreateQuoteRequest } from '@/platform/integrations/emporix/model/quote';
import { CheckoutAddress } from '../checkout';

/**
 * Quote entity for the application
 */
export interface Quote {
  id: string;
  reference?: string;
  status: QuoteStatus;
  submittedDate: string;
  customerId: string;
  customerName?: string;
  approverId?: string;
  approverName?: string;
  currency: string;
  totalGross: number;
  totalNet: number;
  totalVat: number;
  items: QuoteItem[];
  cartId?: string;
  shippingAddress: CheckoutAddress;
  shippingCost: number;
  shippingMethod: string;
}

/**
 * Quote item
 */
export interface QuoteItem {
  product: QuoteItemProduct;
  quantity: {
    quantity: number;
    unitCode: string;
  };
}

export interface QuoteItemProduct {
  quantity: number;
  itemPrice: ApprovalPrice;
  id: string;
  name?: string | LocalizedString;
}

export type CreateQuoteInput = EmporixCreateQuoteRequest;

export interface QuoteReason {
  id: string;
  code: string;
  message: LocalizedString;
  type: string;
  metadata: EmporixMetadata;
}

export interface CreateQuoteReasonRequest {
  code: string;
  type: string;
  message: LocalizedString;
}

export interface QuoteReasonCreationResponse {
  id: string;
}
