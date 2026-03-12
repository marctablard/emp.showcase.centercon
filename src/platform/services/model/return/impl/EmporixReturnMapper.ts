import { injectable } from '@/platform/core/di/injectable';
import {
  EmporixReturnCalculatedPrice,
  EmporixReturnCalculatedValue,
  EmporixReturnOrder,
  EmporixReturnOrderItem,
  EmporixReturnPrice,
  EmporixReturnReason,
  EmporixReturnRequestor,
  EmporixReturnResponse,
} from '@/platform/integrations/emporix/model/return';
import {
  Return,
  ReturnCalculatedPrice,
  ReturnCalculatedValue,
  ReturnItem,
  ReturnOrder,
  ReturnPrice,
  ReturnReason,
  ReturnRequestor,
} from '@/platform/services/model/return';
import { ReturnMapper } from '../ReturnMapper';

/**
 * Implementation of ReturnMapper for Emporix return data.
 * Maps between Emporix API return format and internal Return model.
 */
@injectable('EmporixReturnMapper', 'Singleton')
export class EmporixReturnMapper implements ReturnMapper<EmporixReturnResponse> {
  /**
   * Maps an Emporix return to the internal Return model.
   *
   * @param source - The Emporix return data
   * @returns The internal Return model
   */
  mapToService(source: EmporixReturnResponse): Return {
    const isExpired = this.calculateIsExpired(source.expiryDate);

    return {
      id: source.id,
      status: source.approvalStatus,
      received: source.received ?? false,
      expiryDate: source.expiryDate,
      isExpired,
      total: source.total ? this.mapPrice(source.total) : undefined,
      calculatedPrice: source.calculatedPrice ? this.mapCalculatedPrice(source.calculatedPrice) : undefined,
      reason: source.reason ? this.mapReason(source.reason) : undefined,
      orders: this.mapOrders(source.orders),
      requestor: source.requestor ? this.mapRequestor(source.requestor) : undefined,
      createdAt: source.metadata?.createdAt,
      updatedAt: source.metadata?.modifiedAt,
    };
  }

  /**
   * Maps an internal Return model back to Emporix return format.
   * Note: This is not typically used as returns are read-only in this context.
   *
   * @param service - The internal Return model
   * @returns The Emporix return data
   */
  mapToSource(service: Return): EmporixReturnResponse {
    return {
      id: service.id,
      approvalStatus: service.status,
      received: service.received,
      expiryDate: service.expiryDate,
      total: service.total ? this.mapPriceToSource(service.total) : undefined,
      calculatedPrice: service.calculatedPrice ? this.mapCalculatedPriceToSource(service.calculatedPrice) : undefined,
      reason: service.reason ? this.mapReasonToSource(service.reason) : undefined,
      orders: this.mapOrdersToSource(service.orders),
      requestor: service.requestor ? this.mapRequestorToSource(service.requestor) : undefined,
      metadata: {
        createdAt: service.createdAt,
        modifiedAt: service.updatedAt,
      },
    };
  }

  /**
   * Calculates if the return has expired based on expiryDate.
   */
  private calculateIsExpired(expiryDate?: string): boolean {
    if (!expiryDate) {
      return false;
    }
    try {
      const expiry = new Date(expiryDate);
      const now = new Date();
      return expiry < now;
    } catch {
      return false;
    }
  }

  /**
   * Maps Emporix price to service price.
   */
  private mapPrice(source: EmporixReturnPrice): ReturnPrice {
    return {
      value: source.value,
      currency: source.currency,
    };
  }

  /**
   * Maps service price to Emporix price.
   */
  private mapPriceToSource(service: ReturnPrice): EmporixReturnPrice {
    return {
      value: service.value,
      currency: service.currency,
    };
  }

  private mapCalculatedValue(source: EmporixReturnCalculatedValue, currency?: string): ReturnCalculatedValue {
    return {
      netValue: source.netValue,
      grossValue: source.grossValue,
      taxValue: source.taxValue,
      taxCode: source.taxCode,
      taxRate: source.taxRate,
      valid: source.valid,
      currency: source.currency ?? currency,
    };
  }

  private mapCalculatedValueToSource(service: ReturnCalculatedValue): EmporixReturnCalculatedValue {
    return {
      netValue: service.netValue,
      grossValue: service.grossValue,
      taxValue: service.taxValue,
      taxCode: service.taxCode,
      taxRate: service.taxRate,
      valid: service.valid,
      currency: service.currency,
    };
  }

  private mapCalculatedPrice(source: EmporixReturnCalculatedPrice, currency?: string): ReturnCalculatedPrice {
    return {
      finalPrice: this.mapCalculatedValue(source.finalPrice, currency),
    };
  }

  private mapCalculatedPriceToSource(service: ReturnCalculatedPrice): EmporixReturnCalculatedPrice {
    return {
      finalPrice: this.mapCalculatedValueToSource(service.finalPrice),
    };
  }

  /**
   * Maps Emporix reason to service reason.
   */
  private mapReason(source: EmporixReturnReason): ReturnReason {
    return {
      code: source.code,
      details: source.details,
    };
  }

  /**
   * Maps service reason to Emporix reason.
   */
  private mapReasonToSource(service: ReturnReason): EmporixReturnReason {
    return {
      code: service.code,
      details: service.details,
    };
  }

  /**
   * Maps Emporix orders array to service orders.
   */
  private mapOrders(orders?: EmporixReturnOrder[]): ReturnOrder[] {
    if (!orders) {
      return [];
    }
    return orders.map((order) => this.mapOrder(order));
  }

  /**
   * Maps a single Emporix order to service order.
   */
  private mapOrder(source: EmporixReturnOrder): ReturnOrder {
    return {
      id: source.id,
      items: this.mapItems(source.items),
    };
  }

  /**
   * Maps service orders to Emporix orders.
   */
  private mapOrdersToSource(orders: ReturnOrder[]): EmporixReturnOrder[] {
    return orders.map((order) => ({
      id: order.id,
      items: this.mapItemsToSource(order.items),
    }));
  }

  /**
   * Maps Emporix items array to service items.
   */
  private mapItems(items?: EmporixReturnOrderItem[]): ReturnItem[] {
    if (!items) {
      return [];
    }
    return items.map((item) => this.mapItem(item));
  }

  /**
   * Maps a single Emporix item to service item.
   */
  private mapItem(source: EmporixReturnOrderItem): ReturnItem {
    return {
      id: source.id,
      name: source.name,
      quantity: source.quantity,
      unitPrice: source.unitPrice ? this.mapPrice(source.unitPrice) : undefined,
      total: source.total ? this.mapPrice(source.total) : undefined,
      calculatedUnitPrice: source.calculatedUnitPrice
        ? this.mapCalculatedValue(source.calculatedUnitPrice, source.unitPrice?.currency ?? source.total?.currency)
        : undefined,
      calculatedPrice: source.calculatedPrice
        ? this.mapCalculatedPrice(source.calculatedPrice, source.total?.currency)
        : undefined,
      reason: source.reason ? this.mapReason(source.reason) : undefined,
    };
  }

  /**
   * Maps service items to Emporix items.
   */
  private mapItemsToSource(items: ReturnItem[]): EmporixReturnOrderItem[] {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice ? this.mapPriceToSource(item.unitPrice) : undefined,
      total: item.total ? this.mapPriceToSource(item.total) : undefined,
      calculatedUnitPrice: item.calculatedUnitPrice
        ? this.mapCalculatedValueToSource(item.calculatedUnitPrice)
        : undefined,
      calculatedPrice: item.calculatedPrice ? this.mapCalculatedPriceToSource(item.calculatedPrice) : undefined,
      reason: item.reason ? this.mapReasonToSource(item.reason) : undefined,
    }));
  }

  /**
   * Maps Emporix requestor to service requestor.
   */
  private mapRequestor(source: EmporixReturnRequestor): ReturnRequestor {
    const firstName = source.firstName ?? '';
    const lastName = source.lastName ?? '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || undefined;

    return {
      customerId: source.customerId,
      firstName: source.firstName,
      lastName: source.lastName,
      email: source.email,
      fullName,
    };
  }

  /**
   * Maps service requestor to Emporix requestor.
   */
  private mapRequestorToSource(service: ReturnRequestor): EmporixReturnRequestor {
    return {
      customerId: service.customerId,
      firstName: service.firstName,
      lastName: service.lastName,
      email: service.email,
    };
  }
}

export default EmporixReturnMapper;
