'use client';

import { create } from 'zustand';
import { Site } from '@/platform/services/model/common/site';

export interface SiteState {
  // Site data
  site: Site | null | undefined;
  loading: boolean;
  error: Error | null;
}

interface SiteActions {
  setSite: (site: Site | null) => void;
  getSite: () => Site | null | undefined;

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
  return create<SiteStore>()((set, get) => ({
    ...initState,
    setSite: (site: Site | null | undefined) => set({ site }),
    getSite: () => get().site,
    setLoading: (loading: boolean) => set({ loading }),
    getLoading: () => get().loading,
    reset: () => set(defaultState),
  }));
};
