'use client';

import type { Layout, Layouts } from 'react-grid-layout';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardState {
  // Dashboard layout data
  layout: Layouts;
  loading: boolean;
  error: Error | null;
}

interface DashboardActions {
  setLayout: (layout: Layouts) => void;
  getLayout: () => Layouts;
  resetLayout: () => void;
  setLoading: (loading: boolean) => void;
  getLoading: () => boolean;
}

export type DashboardStore = DashboardState & DashboardActions;

// Default layout configuration for the dashboard
const defaultLayout: Layouts = {
  // Large screens (≥1200px) - 3 columns
  xl: [
    // Top row - small stat cards (half height)
    { i: 'revenue', x: 0, y: 0, w: 1, h: 1 },
    { i: 'orders', x: 1, y: 0, w: 1, h: 1 },
    { i: 'approvals', x: 2, y: 0, w: 1, h: 1 },

    // Second row - larger content cards (double height)
    { i: 'budget', x: 0, y: 1, w: 4, h: 2 },
    { i: 'inbox', x: 4, y: 1, w: 4, h: 2 },
    { i: 'weather', x: 8, y: 1, w: 4, h: 2 },
  ],

  // Medium screens (≥996px) - 2-3 columns
  lg: [
    // Top row - small stat cards
    { i: 'revenue', x: 0, y: 0, w: 3, h: 1 },
    { i: 'orders', x: 3, y: 0, w: 3, h: 1 },
    { i: 'approvals', x: 6, y: 0, w: 4, h: 1 },

    // Second row - larger content cards
    { i: 'budget', x: 0, y: 1, w: 5, h: 2 },
    { i: 'inbox', x: 5, y: 1, w: 5, h: 2 },
    { i: 'weather', x: 0, y: 3, w: 10, h: 2 },
  ],

  // Small screens (≥768px) - 2 columns
  md: [
    // Stat cards in first row
    { i: 'revenue', x: 0, y: 0, w: 1, h: 1 },
    { i: 'orders', x: 1, y: 0, w: 1, h: 1 },
    { i: 'approvals', x: 0, y: 1, w: 2, h: 1 },

    // Content cards stacked
    { i: 'budget', x: 0, y: 2, w: 2, h: 2 },
    { i: 'inbox', x: 0, y: 4, w: 2, h: 2 },
    { i: 'weather', x: 0, y: 6, w: 2, h: 2 },
  ],

  // Extra small screens (≥480px) - 1 column
  sm: [
    // All cards stacked vertically
    { i: 'revenue', x: 0, y: 0, w: 1, h: 1 },
    { i: 'orders', x: 0, y: 1, w: 1, h: 1 },
    { i: 'approvals', x: 0, y: 2, w: 1, h: 1 },
    { i: 'budget', x: 0, y: 3, w: 1, h: 2 },
    { i: 'inbox', x: 0, y: 5, w: 1, h: 2 },
    { i: 'weather', x: 0, y: 7, w: 1, h: 2 },
  ],
};

const defaultState: DashboardState = {
  layout: defaultLayout,
  loading: false,
  error: null,
};

// Create the dashboard store with persistence
export const createDashboardStore = (initState: DashboardState = defaultState) => {
  return create<DashboardStore>()(
    persist(
      (set, get) => ({
        ...initState,
        setLayout: (layout: Layouts) => set({ layout: defaultLayout }),
        getLayout: () => get().layout,
        resetLayout: () => set({ layout: defaultLayout }),
        setLoading: (loading: boolean) => set({ loading }),
        getLoading: () => get().loading,
      }),
      {
        name: 'dashboard-layout', // localStorage key
      },
    ),
  );
};

// Create a singleton instance of the dashboard store
export const useDashboardStore = createDashboardStore();
