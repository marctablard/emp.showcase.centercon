import { injectable } from '@/platform/core/di/injectable';
import { EmporixQuote } from '@/platform/integrations/emporix/model/quote';
import { Quote } from '..';
import { LocalizedString } from '../../common';
import { QuoteMapper } from './QuoteMapper';

/**
 * Implementation of QuoteMapper for Emporix quotes.
 * Maps Emporix Quote to internal Quote model
 */
@injectable('QuoteMapper', 'Singleton')
export class EmporixQuoteMapper implements QuoteMapper<EmporixQuote> {
  mapToService(emporixQuote: EmporixQuote): Quote {
    const customerName = `${emporixQuote.customer.firstName || ''} ${emporixQuote.customer.lastName || ''}`.trim();

    const approverName = emporixQuote.employee
      ? `${emporixQuote.employee.firstName || ''} ${emporixQuote.employee.lastName || ''}`.trim()
      : undefined;

    const status = emporixQuote.status?.value;

    return {
      id: emporixQuote.id,
      reference: emporixQuote.id,
      status: status,
      cartId: emporixQuote.cartId,
      submittedDate: emporixQuote.metadata.createdAt,
      customerId: emporixQuote.customer?.customerId || '',
      customerName: customerName,
      approverId: emporixQuote.employee?.employeeId,
      approverName: approverName,
      currency: emporixQuote.currency,
      totalGross: emporixQuote.totalPrice?.grossValue || 0,
      totalNet: emporixQuote.totalPrice.netValue,
      totalVat: emporixQuote.totalPrice.taxValue,
      items: (emporixQuote.items || []).map((item) => ({
        product: {
          id: item.product.productId,
          name: item.product.name,
        },
        quantity: {
          quantity: item.quantity.quantity,
          unitCode: item.quantity.unitCode,
        },
      })),
    };
  }
}

export default EmporixQuoteMapper;
