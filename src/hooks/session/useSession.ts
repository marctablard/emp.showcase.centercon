'use client';

import { useCallback, useEffect } from 'react';
import {
  fetchCurrentSession,
  updateSessionCountry,
  updateSessionCurrency,
  updateSessionLanguage,
  updateSessionRegion,
  updateSessionSite,
} from '@/lib/client/session';
import { Session } from '@/platform/services/model/session/session';
import { useSessionStore } from '@/providers/StoreProvider';

/**
 * Hook for managing session data
 * Provides methods to get and update session information
 */
export function useSession() {
  // Get state from the store
  const sessionStore = useSessionStore();
  const session = sessionStore.session;
  const loading = sessionStore.loading;

  const fetchSession = useCallback(async () => {
    sessionStore.setLoading(true);
    const sessionData = await fetchCurrentSession();
    sessionStore.setSession(sessionData);
    sessionStore.setLoading(false);
  }, [sessionStore]);
  // Fetch session data on initial load
  useEffect(() => {
    if (sessionStore.session !== undefined || sessionStore.loading) {
      return;
    }
    fetchSession();
  }, [sessionStore.session, sessionStore.loading, fetchSession]);

  /**
   * Update the session language
   */
  const setLanguage = async (language: string): Promise<boolean> => {
    sessionStore.setLoading(true);
    const success = await updateSessionLanguage(language);
    if (success) {
      const updatedSession = await fetchCurrentSession();
      sessionStore.setSession(updatedSession);
    }
    sessionStore.setLoading(false);
    return success;
  };

  /**
   * Update the session currency
   */
  const setCurrency = async (currency: string): Promise<boolean> => {
    sessionStore.setLoading(true);
    const success = await updateSessionCurrency(currency);
    if (success) {
      const updatedSession = await fetchCurrentSession();
      sessionStore.setSession(updatedSession);
    }
    sessionStore.setLoading(false);
    return success;
  };

  /**
   * Update the session country
   */
  const setCountry = async (country: string): Promise<boolean> => {
    sessionStore.setLoading(true);
    const success = await updateSessionCountry(country);
    if (success) {
      const updatedSession = await fetchCurrentSession();
      sessionStore.setSession(updatedSession);
    }
    sessionStore.setLoading(false);
    return success;
  };

  /**
   * Update the session site
   */
  const setSite = async (site: string): Promise<boolean> => {
    sessionStore.setLoading(true);
    const success = await updateSessionSite(site);
    if (success) {
      const updatedSession = await fetchCurrentSession();
      sessionStore.setSession(updatedSession);
    }
    sessionStore.setLoading(false);
    return success;
  };

  /**
   * Update the session region
   */
  const setRegion = async (region: string): Promise<boolean> => {
    sessionStore.setLoading(true);
    const success = await updateSessionRegion(region);
    if (success) {
      const updatedSession = await fetchCurrentSession();
      sessionStore.setSession(updatedSession);
    }
    sessionStore.setLoading(false);
    return success;
  };

  /**
   * Manually refresh the session data
   */
  const refreshSession = async (): Promise<Session | null | undefined> => {
    sessionStore.setLoading(true);
    const updatedSession = await fetchCurrentSession();
    sessionStore.setSession(updatedSession);
    sessionStore.setLoading(false);
    return updatedSession;
  };

  return {
    session,
    loading,
    setLanguage,
    setCurrency,
    setCountry,
    setSite,
    setRegion,
    refreshSession,
  };
}

export type UseSessionReturn = ReturnType<typeof useSession>;
