'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight, List, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ShoppingList } from '@/platform/services/model/shopping-list/shopping-list';
import { useCartStore } from '@/providers/StoreProvider';

interface ProductSearchResult {
  id: string;
  name: string;
  sku?: string;
  imageUrl?: string;
}

interface ProjectShoppingListsTabProps {
  projectId: string;
  lists: ShoppingList[];
  onCreateList: (name: string) => Promise<ShoppingList>;
  onDeleteList: (listId: string) => Promise<void>;
  onAddItem: (listId: string, productId: string, quantity: number) => Promise<any>;
  onRemoveItem: (listId: string, itemId: string) => Promise<void>;
  onAddToCart: (listId: string, cartId: string, itemId?: string) => Promise<{ added: number; failed: number }>;
}

async function searchProducts(query: string): Promise<ProductSearchResult[]> {
  if (!query.trim()) return [];
  const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&size=8`);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.items ?? []).map((p: any) => ({
    id: p.id,
    name: typeof p.name === 'object' ? (p.name.en ?? Object.values(p.name)[0]) : (p.name ?? p.id),
    sku: p.sku ?? p.productId,
    imageUrl: p.images?.[0]?.url ?? p.media?.[0]?.url,
  }));
}

interface AddProductDialogProps {
  listId: string;
  onAdd: (listId: string, productId: string, quantity: number) => Promise<any>;
  onClose: () => void;
}

function AddProductDialog({ listId, onAdd, onClose }: AddProductDialogProps) {
  const t = useTranslations('account.projects.shoppingLists');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    try {
      const r = await searchProducts(query);
      setResults(r);
    } finally {
      setSearchLoading(false);
    }
  }, [query]);

  const handleAdd = async (product: ProductSearchResult) => {
    const qty = quantities[product.id] ?? 1;
    setAdding(product.id);
    try {
      await onAdd(listId, product.id, qty);
      setAddedIds((prev) => new Set([...prev, product.id]));
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t('addProduct')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('searchProducts')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searchLoading} variant="secondary" className="gap-2">
              {searchLoading ? <Spinner /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {results.length > 0 && (
            <div className="border border-border-primary rounded-md divide-y divide-border-primary max-h-72 overflow-y-auto">
              {results.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3">
                  {product.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    {product.sku && <p className="text-xs text-text-secondary">SKU: {product.sku}</p>}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={quantities[product.id] ?? 1}
                    onChange={(e) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [product.id]: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                    className="w-16 text-center"
                  />
                  <Button
                    size="small"
                    variant={addedIds.has(product.id) ? 'secondary' : 'primary'}
                    disabled={adding === product.id}
                    onClick={() => handleAdd(product)}
                  >
                    {adding === product.id ? (
                      <Spinner />
                    ) : addedIds.has(product.id) ? (
                      '✓'
                    ) : (
                      t('addProduct').split(' ')[0]
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && query && !searchLoading && (
            <p className="text-sm text-text-secondary text-center py-4">{t('noResults')}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectShoppingListsTab({
  projectId: _projectId,
  lists,
  onCreateList,
  onDeleteList,
  onAddItem,
  onRemoveItem,
  onAddToCart,
}: ProjectShoppingListsTabProps) {
  const t = useTranslations('account.projects.shoppingLists');
  const cartStore = useCartStore();
  const cartId = cartStore.currentCart?.id ?? null;
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [addProductListId, setAddProductListId] = useState<string | null>(null);
  const [cartActionState, setCartActionState] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    try {
      await onCreateList(newListName.trim());
      setNewListName('');
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  const handleAddToCart = async (listId: string, itemId?: string) => {
    const key = itemId ? `${listId}_${itemId}` : listId;
    setCartActionState((s) => ({ ...s, [key]: 'loading' }));
    try {
      if (!cartId) {
        throw new Error('No active cart found. Please add an item to your cart first.');
      }
      await onAddToCart(listId, cartId, itemId);
      setCartActionState((s) => ({ ...s, [key]: 'success' }));
      setTimeout(() => setCartActionState((s) => ({ ...s, [key]: 'idle' })), 2000);
    } catch {
      setCartActionState((s) => ({ ...s, [key]: 'error' }));
      setTimeout(() => setCartActionState((s) => ({ ...s, [key]: 'idle' })), 3000);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (deleteConfirm !== listId) {
      setDeleteConfirm(listId);
      return;
    }
    await onDeleteList(listId);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setShowCreate(true)} size="small" className="gap-2">
          <Plus className="h-4 w-4" />
          {t('newList')}
        </Button>
      </div>

      {/* Create new list inline */}
      {showCreate && (
        <div className="border border-border-primary rounded-md p-4 bg-surface-image-background flex gap-3 items-end">
          <div className="flex-1 grid gap-1.5">
            <Label>{t('listName')}</Label>
            <Input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={t('listNamePlaceholder')}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
              autoFocus
            />
          </div>
          <Button onClick={handleCreateList} disabled={creating || !newListName.trim()}>
            {creating ? t('creating') : t('createList')}
          </Button>
          <Button variant="neutral" size="icon" onClick={() => setShowCreate(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Lists */}
      {lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-primary rounded-md gap-3">
          <List className="h-10 w-10 text-text-on-disabled" />
          <div>
            <p className="font-medium">{t('noLists')}</p>
            <p className="text-sm text-text-secondary">{t('noListsDescription')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => {
            const isExpanded = expandedList === list.id;
            const cartKey = list.id;
            const cartState = cartActionState[cartKey] ?? 'idle';

            return (
              <div key={list.id} className="border border-border-primary rounded-md overflow-hidden">
                {/* List header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-surface-image-background">
                  <button
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => setExpandedList(isExpanded ? null : list.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <span className="font-medium">{list.name}</span>
                    <span className="text-xs text-text-secondary">{t('items', { count: list.items.length })}</span>
                  </button>

                  <div className="flex gap-2 items-center">
                    <Button
                      size="small"
                      variant="secondary"
                      className="gap-1.5"
                      disabled={list.items.length === 0 || cartState === 'loading'}
                      onClick={() => handleAddToCart(list.id)}
                    >
                      {cartState === 'loading' ? <Spinner /> : <ShoppingCart className="h-3.5 w-3.5" />}
                      {cartState === 'success'
                        ? t('addedToCart')
                        : cartState === 'error'
                          ? t('addToCartError')
                          : t('addToCart')}
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      className="gap-1.5"
                      onClick={() => setAddProductListId(list.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('addProduct')}
                    </Button>
                    {deleteConfirm === list.id && (
                      <span className="text-xs text-text-error">{t('confirmDeleteList')}</span>
                    )}
                    <Button
                      size="icon"
                      variant="neutral"
                      className="text-text-secondary hover:text-text-error h-8 w-8"
                      onClick={() => handleDeleteList(list.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Items table */}
                {isExpanded && (
                  <div className="border-t border-border-primary">
                    {list.items.length === 0 ? (
                      <div className="py-6 text-center text-sm text-text-secondary">{t('emptyList')}</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('product')}</TableHead>
                            <TableHead className="w-20 text-center">{t('quantity')}</TableHead>
                            <TableHead className="w-36 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.items.map((item) => {
                            const itemCartKey = `${list.id}_${item.id}`;
                            const itemCartState = cartActionState[itemCartKey] ?? 'idle';
                            const name =
                              typeof item.name === 'object'
                                ? ((item.name as Record<string, string>)?.en ?? item.productId)
                                : (item.name ?? item.productId);

                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{name}</span>
                                    {item.sku && <span className="text-xs text-text-secondary">SKU: {item.sku}</span>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      size="small"
                                      variant="secondary"
                                      className="h-7 gap-1 text-xs"
                                      disabled={itemCartState === 'loading'}
                                      onClick={() => handleAddToCart(list.id, item.id)}
                                    >
                                      {itemCartState === 'loading' ? <Spinner /> : <ShoppingCart className="h-3 w-3" />}
                                      {itemCartState === 'success' ? '✓' : t('addOneToCart')}
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="neutral"
                                      className="h-7 w-7 text-text-secondary hover:text-text-error"
                                      onClick={() => onRemoveItem(list.id, item.id)}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add product dialog */}
      {addProductListId && (
        <AddProductDialog listId={addProductListId} onAdd={onAddItem} onClose={() => setAddProductListId(null)} />
      )}
    </div>
  );
}
