import { cache } from 'react';
import { Session } from '@/platform/services/model/session';
import { SessionService } from '@/platform/services/session';

const getSessionService = () => globalThis.EMP.platform.ssr.get<SessionService>('SessionService');

const _getSession = cache(async (): Promise<Session | null | undefined> => {
  try {
    const session = await getSessionService().getCurrent();
    return session || null;
  } catch (_error) {
    return undefined;
  }
});

const _setSessionLanguage = cache(async (language: string): Promise<void> => {
  try {
    await getSessionService().setLanguage(language);
  } catch (_error) {
    return;
  }
});

export function setSessionLanguage(language: string): Promise<void> {
  return _setSessionLanguage(language);
}

export function getSession(): Promise<Session | null | undefined> {
  return _getSession();
}
