import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { ShoppingListService } from '@/platform/services/shopping-list/ShoppingListService';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; listId: string }> }) {
  try {
    const { listId } = await params;
    const shoppingListService = server.get<ShoppingListService>('ShoppingListService');
    const body = await request.json();
    const item = await shoppingListService.addItem(listId, body.productId, body.quantity ?? 1);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Error adding item to shopping list',
    );
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
