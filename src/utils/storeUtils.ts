'use client';

import { getLogger } from '@/lib/logger/use-logger-client';

/**
 * Clear all persisted stores from localStorage and sessionStorage during logout
 */
export const clearAllPersistedStores = (): void => {
  const localStorageKeys = [
    process.env.NEXT_PUBLIC_HISTORY_STORAGE_NAME || 'history-storage',
    process.env.NEXT_PUBLIC_DASHBOARD_STORAGE_NAME || 'dashboard-storage',
  ];

  // Clear localStorage items
  localStorageKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      getLogger().error({ err: error, storageKey: key }, 'Error clearing localStorage item');
    }
  });
};
