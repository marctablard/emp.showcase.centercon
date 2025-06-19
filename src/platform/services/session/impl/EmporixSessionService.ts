import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type {
  EmporixContextAttribute,
  EmporixSessionContext,
} from '@/platform/integrations/emporix/model/session-context';
import type { EmporixSessionContextApi } from '@/platform/integrations/emporix/session/EmporixSessionContextApi';
import type { SessionMapper } from '@/platform/services/model/session/SessionMapper';
import type { Session } from '@/platform/services/model/session/session';
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

  async setLanguage(language: string): Promise<void> {
    this.sessionContextApi.addOwnSessionContextAttribute({
      key: 'language',
      value: language,
    });
  }

  async setCurrency(currency: string): Promise<void> {
    this.sessionContextApi.updateOwnSessionContext({
      currency: currency,
    });
  }
  async setCountry(country: string): Promise<void> {
    this.sessionContextApi.updateOwnSessionContext({
      targetLocation: country,
    });
  }

  async setSite(site: string): Promise<void> {
    this.sessionContextApi.updateOwnSessionContext({
      siteCode: site,
    });
  }

  /**
   * Get the current session context
   */
  async getCurrent(): Promise<Session | undefined> {
    const sessionContext = await this.sessionContextApi.getOwnSessionContext();
    return sessionContext ? this.mapper.mapToService(sessionContext) : undefined;
  }
}

export default EmporixSessionService;
