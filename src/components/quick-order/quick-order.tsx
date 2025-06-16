'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Plus, Search, ShoppingCart, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/cart/useCart';
import { useToast } from '@/hooks/ui/useToast';
import { useSearch } from '@/hooks/useSearch';

interface QuickOrderItem {
  id: string;
  productId: string | null;
  productName: string | null;
  quantity: number;
  searching: boolean;
  searchResults: any[];
}

interface UploadedProduct {
  productId: string;
  productName: string;
  quantity: number;
}

export function QuickOrderDialog({ trigger }: { trigger: React.ReactNode }) {
  const t = useTranslations('quickOrder');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<QuickOrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { search } = useSearch();
  const { addItem } = useCart();

  // Initialize with 3 empty rows
  useEffect(() => {
    if (items.length === 0) {
      setItems([createEmptyItem(), createEmptyItem(), createEmptyItem()]);
    }
  }, []);

  function createEmptyItem(): QuickOrderItem {
    return {
      id: Math.random().toString(36).substring(2, 9),
      productId: null,
      productName: null,
      quantity: 1,
      searching: false,
      searchResults: [],
    };
  }

  async function handleSearch(index: number, query: string) {
    if (!query.trim()) {
      updateItem(index, { searching: false, searchResults: [] });
      return;
    }

    updateItem(index, { searching: true });

    try {
      await search({
        query,
        page: 0,
        size: 5,
      });

      // Simulate search results - in a real app, this would come from the search API
      setTimeout(() => {
        const results = query.trim()
          ? [
              { id: 'prod1', name: `${query} - Product 1`, price: 19.99 },
              { id: 'prod2', name: `${query} - Product 2`, price: 29.99 },
              { id: 'prod3', name: `${query} - Product 3`, price: 39.99 },
            ]
          : [];

        updateItem(index, {
          searching: false,
          searchResults: results,
        });
      }, 500);
    } catch (error) {
      updateItem(index, { searching: false, searchResults: [] });
      console.error('Search error:', error);
    }
  }

  function selectProduct(index: number, product: any) {
    updateItem(index, {
      productId: product.id,
      productName: product.name,
      searchResults: [],
    });
  }

  function updateItem(index: number, updates: Partial<QuickOrderItem>) {
    setItems((currentItems) => currentItems.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  function addRow() {
    setItems([...items, createEmptyItem()]);
  }

  function removeRow(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  function handleFileUploadClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate file processing
    setTimeout(() => {
      try {
        // This is a dummy implementation - in a real app, you would parse the file
        // (CSV, Excel, etc.) and extract product data
        const dummyProducts: UploadedProduct[] = [
          { productId: 'upload1', productName: 'Uploaded Product 1', quantity: 2 },
          { productId: 'upload2', productName: 'Uploaded Product 2', quantity: 3 },
          { productId: 'upload3', productName: 'Uploaded Product 3', quantity: 1 },
        ];

        // Convert uploaded products to QuickOrderItems
        const newItems = dummyProducts.map((product) => ({
          id: Math.random().toString(36).substring(2, 9),
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          searching: false,
          searchResults: [],
        }));

        // Replace current items with uploaded ones
        setItems(newItems);

        toast({
          title: t('uploadSuccess'),
          description: `${newItems.length} products loaded from file`,
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: t('uploadError'),
          description: error instanceof Error ? error.message : 'Failed to process file',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }, 1000);
  }

  async function handleSubmit() {
    const validItems = items.filter((item) => item.productId && item.quantity > 0);

    if (validItems.length === 0) {
      toast({
        title: t('errorMessage'),
        description: t('selectProduct'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add each valid item to the cart
      for (const item of validItems) {
        if (item.productId) {
          await addItem(item.productId, item.quantity);
        }
      }

      toast({
        title: t('successMessage'),
        description: `${validItems.length} ${validItems.length === 1 ? 'product' : 'products'} added`,
      });

      // Reset form and close dialog
      setItems([createEmptyItem(), createEmptyItem(), createEmptyItem()]);
      setOpen(false);
    } catch (error) {
      toast({
        title: t('errorMessage'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start gap-2 mb-4">
              <div className="flex-1 relative">
                {item.productName ? (
                  <div className="flex items-center gap-2">
                    <Input value={item.productName} readOnly className="bg-muted" />
                    <Button
                      variant="link"
                      size="icon"
                      onClick={() => updateItem(index, { productId: null, productName: null })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Input
                        placeholder={t('searchPlaceholder')}
                        onChange={(e) => handleSearch(index, e.target.value)}
                      />
                      {item.searching && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>

                    {item.searchResults.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 p-2 max-h-60 overflow-y-auto">
                        {item.searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="p-2 hover:bg-muted cursor-pointer"
                            onClick={() => selectProduct(index, result)}
                          >
                            {result.name}
                          </div>
                        ))}
                      </Card>
                    )}
                  </>
                )}
              </div>

              <div className="w-20">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <Button variant="link" size="icon" onClick={() => removeRow(index)} disabled={items.length <= 1}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="small" onClick={addRow} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> {t('addRow')}
            </Button>

            <Button
              variant="secondary"
              size="small"
              onClick={handleFileUploadClick}
              className="flex items-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {t('uploadFile')}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              aria-label={t('uploadFile')}
              title={t('uploadFile')}
            />
          </div>

          <Button onClick={handleSubmit} size="small" disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {t('addToCart')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
