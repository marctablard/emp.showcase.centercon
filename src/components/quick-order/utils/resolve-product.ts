import type { Product } from '@/platform/services/model/product';

interface ResolveLogger {
  error: (obj: Record<string, unknown>, msg: string) => void;
}

const BATCH_SIZE = 5;

export async function resolveProductByCode(
  code: string,
  locale: string,
  logger?: ResolveLogger,
): Promise<Product | null> {
  try {
    const url = new URL('/api/search/suggestions', window.location.origin);
    url.searchParams.append('query', code);
    url.searchParams.append('locale', locale);
    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const products: Product[] = data.products ?? [];
    return (
      products.find((p) => p.sku?.toLowerCase() === code.toLowerCase() || p.id?.toLowerCase() === code.toLowerCase()) ??
      null
    );
  } catch (err) {
    logger?.error({ err, code }, 'Failed to resolve product code');
    return null;
  }
}

export async function resolveProductsBatch(
  entries: Array<{ code: string; quantity: number }>,
  locale: string,
  logger?: ResolveLogger,
): Promise<{
  resolved: Array<{ product: Product; quantity: number; code: string }>;
  notFound: Array<{ code: string; quantity: number }>;
}> {
  const resolved: Array<{ product: Product; quantity: number; code: string }> = [];
  const notFound: Array<{ code: string; quantity: number }> = [];

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (entry) => ({
        entry,
        product: await resolveProductByCode(entry.code, locale, logger),
      })),
    );
    for (const { entry, product } of results) {
      if (product) {
        resolved.push({ product, quantity: entry.quantity, code: entry.code });
      } else {
        notFound.push(entry);
      }
    }
  }

  return { resolved, notFound };
}
