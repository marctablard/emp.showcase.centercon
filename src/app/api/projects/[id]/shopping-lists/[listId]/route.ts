import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { ShoppingListService } from '@/platform/services/shopping-list/ShoppingListService';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string; listId: string }> }) {
  try {
    const { listId } = await params;
    const shoppingListService = server.get<ShoppingListService>('ShoppingListService');
    const list = await shoppingListService.getShoppingList(listId);
    if (!list) return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    return NextResponse.json(list);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error fetching shopping list');
    return NextResponse.json({ error: 'Failed to fetch shopping list' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; listId: string }> }) {
  try {
    const { listId } = await params;
    const shoppingListService = server.get<ShoppingListService>('ShoppingListService');
    await shoppingListService.deleteShoppingList(listId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error deleting shopping list');
    return NextResponse.json({ error: 'Failed to delete shopping list' }, { status: 500 });
  }
}
