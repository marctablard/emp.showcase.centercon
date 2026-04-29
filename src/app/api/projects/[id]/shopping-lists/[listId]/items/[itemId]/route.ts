import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { ShoppingListService } from '@/platform/services/shopping-list/ShoppingListService';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; listId: string; itemId: string }> },
) {
  try {
    const { listId, itemId } = await params;
    const shoppingListService = server.get<ShoppingListService>('ShoppingListService');
    await shoppingListService.removeItem(listId, itemId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Error removing shopping list item',
    );
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
