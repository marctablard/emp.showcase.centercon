import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand/react';
import { Product } from '@/platform/services/model/product';

// re-export for convenience
export { useHistoryStore } from '@/providers/StoreProvider';

export type HistoryState = {
  lastSeenProducts: Product[];
  searchHistory: string[];
};

export type HistoryActions = {
  addLastSeenProduct: (product: Product) => void;
  addSearchQuery: (query: string) => void;
  clearLastSeenProducts: () => void;
  clearSearchHistory: () => void;
  getLastSeenProducts: () => Product[];
  getSearchHistory: () => string[];
};

export type HistoryStore = HistoryState & HistoryActions;

const defaultState: HistoryState = {
  lastSeenProducts: [],
  searchHistory: [],
};

export const createHistoryStore = (initState: HistoryState = defaultState) => {
  const MAX_SEARCH_HISTORY = parseInt(process.env.NEXT_PUBLIC_MAX_SEARCH_HISTORY || '10', 10);
  const MAX_LAST_SEEN_PRODUCTS = parseInt(process.env.NEXT_PUBLIC_MAX_LAST_SEEN_PRODUCTS || '12', 10);
  const HISTORY_STORAGE_NAME = process.env.NEXT_PUBLIC_HISTORY_STORAGE_NAME || 'history-storage';

  return create<HistoryStore>()(
    persist(
      immer((set, get) => ({
        ...initState,
        addLastSeenProduct: (product: Product) =>
          set((state) => {
            // Check if product already exists in the list
            const existingIndex = state.lastSeenProducts.findIndex((p) => p.id === product.id);
            if (existingIndex !== -1) {
              state.lastSeenProducts.splice(existingIndex, 1);
            }
            state.lastSeenProducts.push(product);

            // If the list exceeds the maximum size, remove the oldest item (FIFO)
            if (state.lastSeenProducts.length >= MAX_LAST_SEEN_PRODUCTS) {
              state.lastSeenProducts.shift();
            }
          }),
        addSearchQuery: (query: string) =>
          set((state) => {
            if (!query.trim()) return; // Don't add empty queries

            // Check if query already exists in the list
            const existingIndex = state.searchHistory.indexOf(query);
            if (existingIndex !== -1) {
              state.searchHistory.splice(existingIndex, 1);
            }

            // Add the query to the end of the list
            state.searchHistory.push(query);

            // If the list exceeds the maximum size, remove the oldest item (FIFO)
            if (state.searchHistory.length >= MAX_SEARCH_HISTORY) {
              state.searchHistory.shift();
            }
          }),
        clearLastSeenProducts: () =>
          set((state) => {
            state.lastSeenProducts = [];
          }),
        clearSearchHistory: () =>
          set((state) => {
            state.searchHistory = [];
          }),
        getLastSeenProducts: () => get().lastSeenProducts,
        getSearchHistory: () => get().searchHistory,
      })),
      {
        name: HISTORY_STORAGE_NAME, // unique name for localStorage
      },
    ),
  );
};
