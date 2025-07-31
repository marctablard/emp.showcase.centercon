import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand/react';

// re-export for convenience
export { useNotificationStore } from '@/providers/StoreProvider';

export type NotificationState = {
  notifications: Record<string, boolean>;
};

export type NotificationActions = {
  addNotification(key: string): void;
  hasNotification(key: string): boolean;
  clearNotifications(): void;
};

export type NotificationStore = NotificationState & NotificationActions;

const defaultState: NotificationState = {
  notifications: {},
};

export const createNotificationStore = (initState: NotificationState = defaultState) => {
  const STORAGE_NAME = process.env.NEXT_PUBLIC_NOTIFICATION_STORAGE_NAME || 'notification-storage';

  return create<NotificationStore>()(
    persist(
      immer((set, get) => ({
        ...initState,
        addNotification: (key: string) =>
          set((state) => {
            state.notifications[key] = true;
          }),
        hasNotification: (key: string) => get().notifications[key],
        clearNotifications: () =>
          set((state) => {
            state.notifications = {};
          }),
      })),
      {
        name: STORAGE_NAME, // unique name for localStorage
      },
    ),
  );
};
