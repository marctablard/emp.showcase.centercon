import { cache } from 'react';
import { SubMenuItem } from '@/data/navigation-menu';
import type { EmporixCatalogApi } from '@/platform/integrations/emporix/catalog/EmporixCatalogApi';
import { CategoryService } from '@/platform/services/category/CategoryService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import { Category } from '@/platform/services/model/category';
import { Product } from '@/platform/services/model/product';
import { ProductService } from '@/platform/services/product/ProductService';
import ssr from '@/platform/ssr';
import { getRequestSite } from '@/site/server/RequestSite';

const getCategoryService = () => ssr.get<CategoryService>('CategoryService');
const getProductService = () => ssr.get<ProductService>('ProductService');
const getCatalogApi = () => ssr.get<EmporixCatalogApi>('EmporixCatalogApi');
const getLogger = () => ssr.get<LoggerService>('LoggerService');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves a localized string (or plain string) for the given locale.
 * Mirrors the b2b-showcase getCategoryTree helper:
 *   const categoryName = category.name || category.localizedName[lang]
 * but adds a proper type guard.
 */
export function resolveLocalizedName(name: Record<string, string> | string | undefined, locale: string): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[locale] ?? name['en'] ?? Object.values(name)[0] ?? '';
}

/**
 * Recursively converts a Category tree into SubMenuItem[].
 * Only the first two levels are returned:
 *   level-1 → category.children
 *   level-2 → child.children
 */
function categoryTreeToNavItems(categories: Category[], locale: string): SubMenuItem[] {
  return categories
    .filter((cat) => cat.published !== false)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((cat) => {
      const children = (cat.children as Category[] | undefined) ?? [];
      const publishedChildren = children
        .filter((c) => c.published !== false)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      return {
        label: resolveLocalizedName(cat.name as any, locale),
        href: `/browse/${cat.id}`,
        hasSubmenu: publishedChildren.length > 0,
        submenuItems: publishedChildren.map((child) => ({
          label: resolveLocalizedName(child.name as any, locale),
          href: `/browse/${child.id}`,
          hasSubmenu: false,
          submenuItems: [],
        })),
      } satisfies SubMenuItem;
    });
}

// ---------------------------------------------------------------------------
// Navigation categories (used by the Header server component)
// ---------------------------------------------------------------------------

/**
 * Build nav items from the /category-trees response (preferred path).
 * Trees may wrap leaf categories in a container root (e.g. "ProductRoot").
 * When a root has children we promote those children to level-1.
 */
function navItemsFromTrees(trees: Category[], locale: string): SubMenuItem[] {
  const navItems: SubMenuItem[] = [];

  for (const tree of trees.filter((t) => t.published !== false)) {
    const children = (tree.children as Category[] | undefined) ?? [];
    const publishedChildren = children.filter((c) => c.published !== false);

    if (publishedChildren.length > 0) {
      navItems.push(...categoryTreeToNavItems(publishedChildren, locale));
    } else {
      navItems.push({
        label: resolveLocalizedName(tree.name as any, locale),
        href: `/browse/${tree.id}`,
        hasSubmenu: false,
        submenuItems: [],
      });
    }
  }

  return navItems;
}

/**
 * Fallback: build nav items from the flat /categories list.
 * Used when the tenant has no /category-trees configured.
 *
 * Mirrors the b2b-showcase getCategoryTree() approach but applied to the flat
 * categories list: find roots, attach their children, then promote container
 * roots (those that have published children) so their children become level-1.
 */
async function navItemsFromFlatCategories(locale: string): Promise<SubMenuItem[]> {
  const allCategories = await getCategoryService().getCategories();
  if (allCategories.length === 0) return [];

  // Build a map from parent-id → direct children
  const childrenOf: Map<string, Category[]> = new Map();
  for (const cat of allCategories) {
    const parentId = cat.parent as string | undefined;
    if (parentId) {
      if (!childrenOf.has(parentId)) childrenOf.set(parentId, []);
      childrenOf.get(parentId)!.push(cat);
    }
  }

  // Roots = categories without a parent
  const roots = allCategories.filter((c) => !c.parent && c.published !== false);

  const navItems: SubMenuItem[] = [];

  for (const root of roots) {
    const directChildren = (childrenOf.get(root.id) ?? []).filter((c) => c.published !== false);

    if (directChildren.length > 0) {
      // Root is a container — promote its children to level-1
      for (const child of directChildren.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))) {
        const grandChildren = (childrenOf.get(child.id) ?? [])
          .filter((c) => c.published !== false)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        navItems.push({
          label: resolveLocalizedName(child.name as any, locale),
          href: `/browse/${child.id}`,
          hasSubmenu: grandChildren.length > 0,
          submenuItems: grandChildren.map((gc) => ({
            label: resolveLocalizedName(gc.name as any, locale),
            href: `/browse/${gc.id}`,
            hasSubmenu: false,
            submenuItems: [],
          })),
        } satisfies SubMenuItem);
      }
    }
    // Leaf roots (no children) are skipped — they are typically organisational
    // containers like "ContentRoot" that don't belong in the navigation.
  }

  return navItems;
}

// locale + site are both cache-key dimensions: each site has its own category tree.
const _getNavCategories = cache(async (locale: string, site: string): Promise<SubMenuItem[]> => {
  try {
    // 1. Fetch catalogs published for this site to get the root category IDs.
    //    This mirrors the b2b-showcase approach in product-list-context.js:
    //      fetchCatalogs(tenant, site) → catalog.categoryIds → filter category-trees
    const catalogResponse = await getCatalogApi().getCatalogs({
      size: 100,
      criteria: { publishedSite: site },
    });
    const rootCategoryIds = new Set((catalogResponse.items ?? []).flatMap((c) => c.categoryIds ?? []));

    // 2. Fetch all category trees (requires X-Version: v2 header)
    const allTrees = await getCategoryService().getCategoryTrees();

    // 3. Filter trees to only the roots published for this site
    const siteTrees = rootCategoryIds.size > 0 ? allTrees.filter((t) => rootCategoryIds.has(t.id)) : allTrees;

    if (siteTrees.length > 0) {
      const items = navItemsFromTrees(siteTrees, locale);
      if (items.length > 0) return items;
    }

    // 4. Fallback: build tree from flat /categories list.
    //    Used when the tenant has no catalogs or category-trees configured.
    return await navItemsFromFlatCategories(locale);
  } catch (error) {
    getLogger().error({ error: error instanceof Error ? error.message : String(error) }, 'SSR getNavCategories failed');
    return [];
  }
});

export async function getNavCategories(locale: string): Promise<SubMenuItem[]> {
  const site = await getRequestSite();
  return _getNavCategories(locale, site);
}

// ---------------------------------------------------------------------------
// Category by ID (used by the category PLP)
// ---------------------------------------------------------------------------

const _getCategoryById = cache(async (id: string): Promise<Category | null> => {
  try {
    return await getCategoryService().getCategoryById(id);
  } catch (error) {
    getLogger().error(
      { error: error instanceof Error ? error.message : String(error), categoryId: id },
      'SSR getCategoryById failed',
    );
    return null;
  }
});

export function getCategoryById(id: string): Promise<Category | null> {
  return _getCategoryById(id);
}

// ---------------------------------------------------------------------------
// Products for a category (used by the category PLP)
// ---------------------------------------------------------------------------

const _getProductsForCategory = cache(
  async (categoryId: string, page: number, pageSize: number): Promise<{ products: Product[]; total: number }> => {
    try {
      const { ids, total } = await getCategoryService().getProductIdsForCategory(categoryId, { page, pageSize });

      if (ids.length === 0) return { products: [], total };

      const productResults = await Promise.all(
        ids.map((id) => getProductService().getProductById(id, { prices: true })),
      );

      const products = productResults.filter((p: Product | undefined): p is Product => !!p);
      return { products, total };
    } catch (error) {
      getLogger().error(
        { error: error instanceof Error ? error.message : String(error), categoryId },
        'SSR getProductsForCategory failed',
      );
      return { products: [], total: 0 };
    }
  },
);

export function getProductsForCategory(
  categoryId: string,
  page = 0,
  pageSize = 12,
): Promise<{ products: Product[]; total: number }> {
  return _getProductsForCategory(categoryId, page, pageSize);
}
