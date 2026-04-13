import { inject } from 'inversify';
import 'server-only';
import { injectable } from '@/platform/core/di/injectable';
import { createFetchMetricsParams } from '@/platform/integrations/emporix/metrics-utils';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import type { EmporixConfig } from '../../config';
import type { EmporixContextAttribute, EmporixSessionContext } from '../../model/session-context';
import type { EmporixSessionContextApi as IEmporixSessionContextApi } from '../EmporixSessionContextApi';

const createSessionMetrics = (route: string) => createFetchMetricsParams('session', route);

interface SessionContextSharedCache {
  data: { data: EmporixSessionContext | undefined; expiresAt: number } | null;
  inflight: Promise<EmporixSessionContext | undefined> | null;
}

const SESSION_CTX_CACHE_KEY = '__emporix_session_ctx_cache' as const;

function getSharedSessionCtxCache(): SessionContextSharedCache {
  const g = globalThis as unknown as Record<string, SessionContextSharedCache>;
  if (!g[SESSION_CTX_CACHE_KEY]) {
    g[SESSION_CTX_CACHE_KEY] = { data: null, inflight: null };
  }
  return g[SESSION_CTX_CACHE_KEY];
}

@injectable('EmporixSessionContextApi', 'Singleton')
class EmporixSessionContextApi implements IEmporixSessionContextApi {
  private static readonly OWN_CONTEXT_TTL_MS = 5_000;

  private get _ownContextCache() {
    return getSharedSessionCtxCache().data;
  }
  private set _ownContextCache(v: SessionContextSharedCache['data']) {
    getSharedSessionCtxCache().data = v;
  }
  private get _ownContextInflight() {
    return getSharedSessionCtxCache().inflight;
  }
  private set _ownContextInflight(v: SessionContextSharedCache['inflight']) {
    getSharedSessionCtxCache().inflight = v;
  }

  constructor(
    @inject('EmporixApiInvoker') protected apiClient: EmporixApiClient,
    @inject('EmporixConfig') protected config: EmporixConfig,
  ) {
    this.apiClient = apiClient;
    this.config = config;
  }

  private invalidateOwnContextCache(): void {
    this._ownContextCache = null;
  }

  async getSessionContext(sessionId: string): Promise<EmporixSessionContext | undefined> {
    const response = await this.apiClient.authenticatedFetch(
      `/session-context/${this.config.tenant}/context/${sessionId}`,
      { method: 'GET' },
      'service',
      undefined,
      createSessionMetrics('/session-context/{tenant}/context/{id}'),
    );

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`Failed to get session context: ${response.statusText}`);
    }

    return await response.json();
  }

  async updateSessionContext(
    sessionId: string,
    sessionContext: Partial<EmporixSessionContext>,
    upsert: boolean = false,
  ): Promise<void> {
    const queryParams = upsert ? '?upsert=true' : '';
    const response = await this.apiClient.authenticatedFetch(
      `/session-context/${this.config.tenant}/context/${sessionId}${queryParams}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionContext),
      },
      'service',
      { scopes: ['sessioncontext.context_manage'] },
      createSessionMetrics('/session-context/{tenant}/context/{id}'),
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to update session context: ${response.statusText} - ${message}`);
    }
  }

  async addSessionContextAttribute(sessionId: string, attribute: EmporixContextAttribute): Promise<void> {
    const response = await this.apiClient.authenticatedFetch(
      `/session-context/${this.config.tenant}/context/${sessionId}/attributes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attribute),
      },
      'service',
      { scopes: ['sessioncontext.context_manage'] },
      createSessionMetrics('/session-context/{tenant}/context/{id}/attributes'),
    );

    if (!response.ok) {
      throw new Error(`Failed to add session context attribute: ${response.statusText}`);
    }
  }

  async removeSessionContextAttribute(sessionId: string, attributeName: string): Promise<void> {
    const response = await this.apiClient.authenticatedFetch(
      `/session-context/${this.config.tenant}/context/${sessionId}/attributes/${attributeName}`,
      { method: 'DELETE' },
      'service',
      { scopes: ['sessioncontext.context_manage'] },
      createSessionMetrics('/session-context/{tenant}/context/{id}/attributes/{id}'),
    );

    if (!response.ok) {
      throw new Error(`Failed to remove session context attribute: ${response.statusText}`);
    }
  }

  async getOwnSessionContext(): Promise<EmporixSessionContext | undefined> {
    const now = Date.now();
    if (this._ownContextCache && now < this._ownContextCache.expiresAt) {
      return this._ownContextCache.data;
    }
    if (this._ownContextInflight) {
      return this._ownContextInflight;
    }
    this._ownContextInflight = this._fetchOwnSessionContext(now);
    try {
      return await this._ownContextInflight;
    } finally {
      this._ownContextInflight = null;
    }
  }

  private async _fetchOwnSessionContext(now: number): Promise<EmporixSessionContext | undefined> {
    const response = await this.apiClient.authenticatedFetch(
      `/session-context/${this.config.tenant}/me/context`,
      { method: 'GET' },
      'session',
      undefined,
      createSessionMetrics('/session-context/{tenant}/me/context'),
    );

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`Failed to get own session context: ${response.statusText}`);
    }

    const data: EmporixSessionContext = await response.json();
    this._ownContextCache = { data, expiresAt: now + EmporixSessionContextApi.OWN_CONTEXT_TTL_MS };
    return data;
  }

  async updateOwnSessionContext(sessionContext: Partial<EmporixSessionContext>): Promise<void> {
    this.invalidateOwnContextCache();
    const response = await this.apiClient.authenticatedFetch(
      `/session-context/${this.config.tenant}/me/context`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionContext),
      },
      'session',
      undefined,
      createSessionMetrics('/session-context/{tenant}/me/context'),
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to update own session context: ${response.statusText} - ${message}`);
    }
  }

  async addOwnSessionContextAttribute(attribute: EmporixContextAttribute): Promise<string> {
    this.invalidateOwnContextCache();
    const response = await this.apiClient.authenticatedFetch(
      `/session-context/${this.config.tenant}/me/context/attributes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attribute),
      },
      'session',
      undefined,
      createSessionMetrics('/session-context/{tenant}/me/context/attributes'),
    );

    if (!response.ok) {
      throw new Error(`Failed to add own session context attribute: ${response.statusText}`);
    }

    return await response.text();
  }

  async removeOwnSessionContextAttribute(attributeName: string): Promise<void> {
    this.invalidateOwnContextCache();
    const response = await this.apiClient.authenticatedFetch(
      `/session-context/${this.config.tenant}/me/context/attributes/${attributeName}`,
      { method: 'DELETE' },
      'session',
      undefined,
      createSessionMetrics('/session-context/{tenant}/me/context/attributes/{id}'),
    );

    if (!response.ok) {
      throw new Error(`Failed to remove own session context attribute: ${response.statusText}`);
    }
  }
}

export default EmporixSessionContextApi;
