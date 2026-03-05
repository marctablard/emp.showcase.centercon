import { act, renderHook } from '@testing-library/react';
import { useSession } from './useSession';

const mockFetchCurrentSession = jest.fn();
const mockUpdateSessionLanguage = jest.fn();
const mockUpdateSessionCurrency = jest.fn();
const mockUpdateSessionCountry = jest.fn();
const mockUpdateSessionSite = jest.fn();
const mockUpdateSessionRegion = jest.fn();
const mockUseSessionStore = jest.fn();

jest.mock('@/lib/client/session', () => ({
  fetchCurrentSession: (...args: unknown[]) => mockFetchCurrentSession(...args),
  updateSessionLanguage: (...args: unknown[]) => mockUpdateSessionLanguage(...args),
  updateSessionCurrency: (...args: unknown[]) => mockUpdateSessionCurrency(...args),
  updateSessionCountry: (...args: unknown[]) => mockUpdateSessionCountry(...args),
  updateSessionSite: (...args: unknown[]) => mockUpdateSessionSite(...args),
  updateSessionRegion: (...args: unknown[]) => mockUpdateSessionRegion(...args),
}));

jest.mock('@/providers/StoreProvider', () => ({
  useSessionStore: () => mockUseSessionStore(),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve: ((value: T) => void) | undefined;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  if (!resolve) {
    throw new Error('Deferred resolver was not initialized');
  }
  return { promise, resolve };
};

describe('useSession mutation lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    let mutationInFlight = false;
    const store = {
      session: null,
      loading: false,
      setSession: jest.fn((session) => {
        store.session = session;
      }),
      setLoading: jest.fn((loading) => {
        store.loading = loading;
      }),
      tryAcquireMutationLock: jest.fn(() => {
        if (mutationInFlight) {
          return false;
        }
        mutationInFlight = true;
        return true;
      }),
      releaseMutationLock: jest.fn(() => {
        mutationInFlight = false;
      }),
    };

    mockUseSessionStore.mockReturnValue(store);
    mockFetchCurrentSession.mockResolvedValue({ id: 'session-1', siteCode: 'main' });
    mockUpdateSessionLanguage.mockResolvedValue(true);
    mockUpdateSessionCurrency.mockResolvedValue(true);
    mockUpdateSessionCountry.mockResolvedValue(true);
    mockUpdateSessionSite.mockResolvedValue(true);
    mockUpdateSessionRegion.mockResolvedValue(true);
  });

  it('blocks concurrent mutations across hook instances and allows next mutation after release', async () => {
    const currencyDeferred = createDeferred<boolean>();
    mockUpdateSessionCurrency.mockReturnValueOnce(currencyDeferred.promise);

    const hookA = renderHook(() => useSession());
    const hookB = renderHook(() => useSession());

    let firstMutationPromise: Promise<boolean>;
    act(() => {
      firstMutationPromise = hookA.result.current.setCurrency('EUR');
    });

    let blockedResult: boolean;
    await act(async () => {
      blockedResult = await hookB.result.current.setLanguage('de');
    });

    expect(blockedResult!).toBe(false);
    expect(mockUpdateSessionLanguage).not.toHaveBeenCalled();

    await act(async () => {
      currencyDeferred.resolve(true);
      await firstMutationPromise!;
    });

    let thirdResult: boolean;
    await act(async () => {
      thirdResult = await hookB.result.current.setCountry('DE');
    });

    expect(thirdResult!).toBe(true);
    expect(mockUpdateSessionCurrency).toHaveBeenCalledTimes(1);
    expect(mockUpdateSessionCountry).toHaveBeenCalledTimes(1);
  });
});
