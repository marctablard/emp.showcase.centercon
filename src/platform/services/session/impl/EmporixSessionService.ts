import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type {
  EmporixContextAttribute,
  EmporixSessionContext,
} from '@/platform/integrations/emporix/model/session-context';
import type { EmporixSessionContextApi } from '@/platform/integrations/emporix/session/EmporixSessionContextApi';
import type { SessionMapper } from '@/platform/services/model/session/SessionMapper';
import type { Session, SessionAttribute } from '@/platform/services/model/session/session';
import { SessionService } from '../SessionService';

/**
 * Implementation of SessionService for Emporix session context data.
 * Wraps around the SessionContextApi to provide session management functionality.
 */
@injectable('SessionService', 'Singleton')
class EmporixSessionService implements SessionService {
  private sessionContextApi: EmporixSessionContextApi;
  private mapper: SessionMapper<EmporixSessionContext, EmporixContextAttribute>;

  constructor(
    @inject('EmporixSessionContextApi') sessionContextApi: EmporixSessionContextApi,
    @inject('EmporixSessionMapper') mapper: SessionMapper<EmporixSessionContext, EmporixContextAttribute>,
  ) {
    this.sessionContextApi = sessionContextApi;
    this.mapper = mapper;
  }

  /**
   * Get the current session context
   */
  async getCurrentSession(): Promise<Session | undefined> {
    const sessionContext = await this.sessionContextApi.getOwnSessionContext();
    return sessionContext ? this.mapper.mapToService(sessionContext) : undefined;
  }

  /**
   * Update the current session context
   */
  async updateCurrentSession(session: Partial<Session>): Promise<void> {
    const sessionContext = this.mapper.mapPartialToSource(session);
    await this.sessionContextApi.updateOwnSessionContext(sessionContext);
  }

  /**
   * Add an attribute to the current session context
   */
  async addAttributeToCurrentSession(attribute: SessionAttribute): Promise<string> {
    const integrationAttribute = this.mapper.mapAttributeToSource(attribute);
    return await this.sessionContextApi.addOwnSessionContextAttribute(integrationAttribute);
  }

  /**
   * Remove an attribute from the current session context
   */
  async removeAttributeFromCurrentSession(attributeName: string): Promise<void> {
    await this.sessionContextApi.removeOwnSessionContextAttribute(attributeName);
  }
}

export default EmporixSessionService;
