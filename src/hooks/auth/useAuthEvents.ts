'use client';

import { useEffect } from 'react';

type AuthEventCallback = () => void;

// Global callback sets (outside React component lifecycle)
const loginCallbacks = new Set<AuthEventCallback>();
const logoutCallbacks = new Set<AuthEventCallback>();

/**
 * Hook to subscribe to auth events (login/logout)
 * Returns functions to register callbacks and notify events
 */
export function useAuthEvents() {
  return {
    /**
     * Notify all subscribers that a login occurred
     */
    notifyLogin: () => {
      loginCallbacks.forEach((callback) => callback());
    },

    /**
     * Notify all subscribers that a logout occurred
     */
    notifyLogout: () => {
      logoutCallbacks.forEach((callback) => callback());
    },

    /**
     * Register a callback to be called on login
     * Returns an unsubscribe function
     */
    onLogin: (callback: AuthEventCallback) => {
      loginCallbacks.add(callback);
      return () => {
        loginCallbacks.delete(callback);
      };
    },

    /**
     * Register a callback to be called on logout
     * Returns an unsubscribe function
     */
    onLogout: (callback: AuthEventCallback) => {
      logoutCallbacks.add(callback);
      return () => {
        logoutCallbacks.delete(callback);
      };
    },
  };
}

/**
 * Hook to listen for login events
 * Automatically subscribes/unsubscribes on mount/unmount
 */
export function useOnLogin(callback: AuthEventCallback) {
  const { onLogin } = useAuthEvents();

  useEffect(() => {
    return onLogin(callback);
  }, [callback, onLogin]);
}

/**
 * Hook to listen for logout events
 * Automatically subscribes/unsubscribes on mount/unmount
 */
export function useOnLogout(callback: AuthEventCallback) {
  const { onLogout } = useAuthEvents();

  useEffect(() => {
    return onLogout(callback);
  }, [callback, onLogout]);
}
