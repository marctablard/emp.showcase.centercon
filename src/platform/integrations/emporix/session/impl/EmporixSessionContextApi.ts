import { inject } from 'inversify';
import 'server-only';
import { injectable } from '@/platform/core/di/injectable';
import { createFetchMetricsParams } from '@/platform/integrations/emporix/metrics-utils';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import type { EmporixConfig } from '../../config';
import type { EmporixContextAttribute, EmporixSessionContext } from '../../model/session-context';
import type { EmporixSessionContextApi as IEmporixSessionContextApi } from '../EmporixSessionContextApi';

const createSessionMetrics = (route: string) => createFetchMetricsParams('session', route);

@injectable('EmporixSessionContextApi', 'Singleton')
class EmporixSessionContextApi implements IEmporixSessionContextApi {
  constructor(
    @inject('EmporixApiInvoker') protected apiClient: EmporixApiClient,
    @inject('EmporixConfig') protected config: EmporixConfig,
  ) {
    this.apiClient = apiClient;
    this.config = config;
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

    return await response.json();
  }

  async updateOwnSessionContext(sessionContext: Partial<EmporixSessionContext>): Promise<void> {
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
