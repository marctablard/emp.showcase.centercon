import type { EmporixCreateQuoteRequest } from '@/platform/integrations/emporix/model/quote';

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
}

/**
 * Quote item
 */
export interface QuoteItem {
  product: {
    id: string;
    name?: string | LocalizedString;
  };
  quantity: {
    quantity: number;
    unitCode: string;
  };
}

export type CreateQuoteInput = EmporixCreateQuoteRequest;
