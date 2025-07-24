import { create } from 'zustand';

interface BannerData {
  story?: {
    content: {
      title: string;
      link: {
        id: string;
        url: string;
        target: string;
      };
      is_active: boolean;
    };
  };
}

interface BannerStore {
  // State
  data: BannerData | null;
  error: Error | null;

  // Actions
  setData: (data: BannerData) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

/**
 * Global store for banner data
 * Allows sharing banner data between components
 * and prevents repeated API calls when scrolling
 */
export const useBannerStore = create<BannerStore>((set) => ({
  // Initial state
  data: null,
  error: null,

  // Actions
  setData: (data) => set({ data }),
  setError: (error) => set({ error }),
  reset: () => set({ data: null, error: null }),
}));
