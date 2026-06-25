import type { Order, OrderItem } from '@/platform/services/model/order/order';

export function getReorderableItems(order: Order): OrderItem[] {
  return order.items.filter((item) => item.productId && item.quantity > 0);
}

export function canReorder(order: Order): boolean {
  return getReorderableItems(order).length > 0;
}

export async function reorderOrderItems(
  order: Order,
  addItem: (productId: string, quantity: number) => Promise<unknown>,
): Promise<{ total: number; failed: OrderItem[] }> {
  const items = getReorderableItems(order);
  const failed: OrderItem[] = [];

  for (const item of items) {
    try {
      await addItem(item.productId, item.quantity);
    } catch {
      failed.push(item);
    }
  }

  return { total: items.length, failed };
}
