import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { CategoryService } from '@/platform/services/category/CategoryService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

/**
 * API endpoint to get all product categories
 * GET /api/categories/all
 */
export async function GET(_request: NextRequest) {
  try {
    const categoryService = server.get<CategoryService>('CategoryService');

    // Get all categories from the service
    const allCategories = await categoryService.getCategories();

    // Filter out root categories (productroot, contentroot) and only return actual product categories
    const productCategories = allCategories.filter((category) => {
      // Exclude system root categories
      if (category.code === 'productroot' || category.code === 'contentroot') {
        return false;
      }
      // Only include published/visible categories
      return category.published !== false && category.visible !== false;
    });

    return NextResponse.json(productCategories);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/categories/all',
        method: 'GET',
      },
      'Error fetching all categories',
    );
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
