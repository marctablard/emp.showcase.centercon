/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import type { Quote } from '@/platform/services/model/quote';
import { QuoteDetails } from './quote-details';
import { QuotesTable } from './quotes-table';

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
  useLocale: () => 'en',
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock('@/hooks/quotes/useQuotes', () => ({
  useQuote: () => ({
    quote: null,
    loading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/quotes/useQuoteHistory', () => ({
  useQuoteHistory: () => ({
    history: [],
    loading: false,
  }),
}));

jest.mock('@/hooks/approval/useApproverSearch', () => ({
  useApproverSearch: () => ({
    approvers: undefined,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/components/account/quotes/quote-summary', () => ({
  QuoteSummary: () => <div>QuoteSummary</div>,
}));

jest.mock('@/components/product/product-list-resolver', () => ({
  ProductListResolver: () => <div>ProductListResolver</div>,
}));

jest.mock('@/components/ui/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

jest.mock('@/lib/logger/use-logger-client', () => ({
  getLogger: () => ({
    error: jest.fn(),
  }),
}));

const baseQuote: Quote = {
  id: 'Q-1000',
  status: 'ACCEPTED',
  reference: 'Quote Ref',
  submittedDate: '2026-05-31T10:00:00.000Z',
  customerId: 'customer-1',
  customerName: 'Ada Lovelace',
  currency: 'EUR',
  totalGross: 120,
  totalNet: 100,
  totalVat: 20,
  items: [
    {
      quantity: { quantity: 1, unitCode: 'EA' },
      product: {
        id: 'product-1',
        quantity: 1,
        itemPrice: {
          amount: 120,
          currency: 'EUR',
          baseAmount: 100,
          tax: 20,
        },
      },
    },
  ],
  shippingAddress: {
    type: 'SHIPPING',
    contactName: 'Ada Lovelace',
    street: 'Main Street 1',
    zipCode: '10115',
    city: 'Berlin',
    country: 'Germany',
  },
  shippingCost: 0,
  shippingMethod: 'standard',
};

describe('Quote cross-links', () => {
  it('renders the related order link on quote list and detail views when orderId is present', () => {
    const quoteWithOrder = { ...baseQuote, orderId: 'order-123' };

    render(
      <>
        <QuotesTable quotes={[quoteWithOrder]} />
        <QuoteDetails quoteId={quoteWithOrder.id} initialQuote={quoteWithOrder} />
      </>,
    );

    expect(screen.getAllByText('account.quotesList.relatedOrder')[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '#order-123' })[0]).toHaveAttribute('href', '/account/orders/order-123');
    expect(screen.getByText('account.quoteDetails.relatedOrder')).toBeInTheDocument();
  });

  it('omits related order UI when orderId is absent', () => {
    render(
      <>
        <QuotesTable quotes={[baseQuote]} />
        <QuoteDetails quoteId={baseQuote.id} initialQuote={baseQuote} />
      </>,
    );

    expect(screen.queryByText('account.quotesList.relatedOrder')).not.toBeInTheDocument();
    expect(screen.queryByText('account.quoteDetails.relatedOrder')).not.toBeInTheDocument();
  });
});
