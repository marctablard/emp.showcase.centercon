import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type {
  EmporixContextAttribute,
  EmporixSessionContext,
} from '@/platform/integrations/emporix/model/session-context';
import type { EmporixSessionContextApi } from '@/platform/integrations/emporix/session/EmporixSessionContextApi';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { SessionMapper } from '@/platform/services/model/session/SessionMapper';
import type { Session } from '@/platform/services/model/session/session';
import type { SiteService } from '../../site/SiteService';
import type { SessionService } from '../SessionService';

/**
 * Implementation of SessionService for Emporix session context data.
 * Wraps around the SessionContextApi to provide session management functionality.
 */
@injectable('SessionService', 'Singleton')
class EmporixSessionService implements SessionService {
  // Static default values from environment variables with fallbacks
  private defaultSite = process.env.NEXT_PUBLIC_DEFAULT_SITE || 'main';
  private defaultLanguage = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';
  private defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'DE';
  private defaultRegion = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'Europe';
  private availableSites = process.env.NEXT_PUBLIC_AVAILABLE_SITES?.split(',') || ['main'];

  constructor(
    @inject('EmporixSessionContextApi') private sessionContextApi: EmporixSessionContextApi,
    @inject('EmporixSessionMapper') private mapper: SessionMapper<EmporixSessionContext, EmporixContextAttribute>,
    @inject('SiteService') private siteService: SiteService,
    @inject('LoggerService') private logger: LoggerService,
  ) {}

  async setRegion(region: string): Promise<void> {
    // TODO propagate Region Switch via Event-System
    await this.sessionContextApi.addOwnSessionContextAttribute({
      key: 'region',
      value: region,
    });
  }

  async setLanguage(language: string): Promise<void> {
    // TODO propagate Language Switch via Event-System
    this.sessionContextApi.addOwnSessionContextAttribute({
      key: 'language',
      value: language,
    });
  }

  async setCurrency(currency: string): Promise<void> {
    const session = await this.sessionContextApi.getOwnSessionContext();
    if (!session) {
      return;
    }
    await this.sessionContextApi.updateOwnSessionContext({
      currency: currency,
      metadata: {
        version: session.metadata?.version || 1,
      },
    });
  }

  async setCountry(country: string): Promise<void> {
    const session = await this.sessionContextApi.getOwnSessionContext();
    if (!session) {
      return;
    }
    // TODO propagate Country Switch via Event-System
    await this.sessionContextApi.updateOwnSessionContext({
      targetLocation: country,
      metadata: {
        version: session.metadata?.version || 1,
      },
    });
  }

  async setSite(site: string): Promise<void> {
    const session = await this.sessionContextApi.getOwnSessionContext();
    if (!session) {
      return;
    }

    // Check if site is actually changing
    const siteChanged = session.siteCode && session.siteCode !== site;

    await this.sessionContextApi.updateOwnSessionContext({
      siteCode: site,
      metadata: {
        version: session.metadata?.version || 1,
      },
    });

    // Clear cart association when site changes - cart is site-specific
    if (siteChanged) {
      await this.sessionContextApi.removeOwnSessionContextAttribute('currentCart');
    }
  }

  async setCart(cartId: string): Promise<void> {
    const session = await this.sessionContextApi.getOwnSessionContext();
    if (!session) {
      return;
    }
    this.sessionContextApi.addOwnSessionContextAttribute({
      key: 'currentCart',
      value: cartId,
    });
    /*
    // Needs to be done with Service Authorization!
    await this.sessionContextApi.updateSessionContext(session.sessionId, {
      cartId: cartId,
      metadata: {
        version: session.metadata?.version || 1,
      },
    });
    */
  }

  async getById(id: string): Promise<Session | undefined> {
    const sessionContext = await this.sessionContextApi.getSessionContext(id);
    const result = sessionContext ? this.mapper.mapToService(sessionContext) : undefined;
    return result;
  }

  /**
   * Get the current session context
   */
  async getCurrent(): Promise<Session | undefined> {
    try {
      const sessionContext = await this.sessionContextApi.getOwnSessionContext();
      const result = sessionContext ? this.mapper.mapToService(sessionContext) : undefined;
      if (!result) {
        return undefined;
      }
      await this.adjustSessionsSettings(sessionContext, result);
      return result;
    } catch (_error) {
      // fail silently for ssr context
      return undefined;
    }
  }

  private async adjustSessionsSettings(sessionContext: EmporixSessionContext | undefined, result: Session) {
    const updateDefaults: Partial<EmporixSessionContext> = {};
    if (!sessionContext?.siteCode || !this.availableSites.includes(sessionContext.siteCode)) {
      updateDefaults.siteCode = this.defaultSite;
      result.siteCode = this.defaultSite;
    }
    const site = await this.siteService.getSite(result.siteCode);
    if (!site) {
      return;
    }
    if (!sessionContext?.currency || !site.currencies.find((currency) => currency.id === result.currency)) {
      updateDefaults.currency = site.defaultCurrency.id;
      result.currency = site.defaultCurrency.id;
    }
    if (!result.country) {
      updateDefaults.targetLocation = this.defaultCountry;
      result.country = this.defaultCountry;
    }
    if (!result.language) {
      if (updateDefaults.context) {
        updateDefaults.context.language = this.defaultLanguage;
      } else {
        updateDefaults.context = { language: this.defaultLanguage };
      }
      result.language = this.defaultLanguage;
    }
    if (!result.region) {
      if (updateDefaults.context) {
        updateDefaults.context.region = this.defaultRegion;
      } else {
        updateDefaults.context = { region: this.defaultRegion };
      }
      result.region = this.defaultRegion;
    }
    if (Object.keys(updateDefaults).length > 0) {
      updateDefaults.metadata = {
        version: sessionContext?.metadata?.version || 1,
      };
      // Fire-and-forget: update session defaults in background.
      // 404 errors are expected for newly created sessions due to eventual consistency
      // in the Emporix backend - the session context may not be immediately available
      // for updates after token creation.
      this.sessionContextApi.updateOwnSessionContext(updateDefaults).catch((error: Error) => {
        // Only log unexpected errors (not 404s which are expected for new sessions)
        if (!error.message.includes('Not Found')) {
          this.logger.error({ error: error.message }, 'Unexpected error updating session defaults');
        }
      });
    }
  }
}

export default EmporixSessionService;
