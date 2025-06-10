'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SiteData } from '@/lib/client/site';

export interface SiteState {
  // Site data
  site: SiteData | null | undefined;
  loading: boolean;
  error: Error | null;
}

interface SiteActions {
  setSite: (site: SiteData | null) => void;
  getSite: () => SiteData | null | undefined;
  setLoading: (loading: boolean) => void;
  getLoading: () => boolean;
  reset: () => void;
}
export type SiteStore = SiteState & SiteActions;

const defaultState: SiteState = {
  site: undefined,
  loading: false,
  error: null,
};

export const createSiteStore = (initState: SiteState = defaultState) => {
  return create<SiteStore>()(
    persist(
      (set, get) => ({
        ...initState,
        setSite: (site: SiteData | null | undefined) => set({ site }),
        getSite: () => get().site,
        setLoading: (loading: boolean) => set({ loading }),
        getLoading: () => get().loading,
        reset: () => set(defaultState),
      }),
      {
        name: 'emp-site',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
};

// Default store instance
export const useSiteStore = createSiteStore();
