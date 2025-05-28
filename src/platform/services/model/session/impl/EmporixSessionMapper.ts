import type { EmporixSessionContext, EmporixContextAttribute } from "@/platform/integrations/emporix/model/session-context";
import type { Session, SessionAttribute } from "../session";
import type { SessionMapper } from "../SessionMapper";
import { injectable } from "@/platform/core/di/injectable";

/**
 * Implementation of SessionMapper for Emporix session context data.
 * Maps between Emporix API session context format and internal Session model.
 */
@injectable('EmporixSessionMapper', "Singleton")
export class EmporixSessionMapper implements SessionMapper<EmporixSessionContext, EmporixContextAttribute> {
  /**
   * Maps from integration layer SessionContext to service layer Session
   */
  mapToService(source: EmporixSessionContext): Session {
    const attributes: Record<string, SessionAttribute> = {};
    
    // Map context attributes if they exist
    if (source.context) {
      Object.entries(source.context).forEach(([key, attribute]) => {
        attributes[key] = {
          key: attribute.key,
          value: attribute.value
        };
      });
    }
    
    return {
      id: source.sessionId,
      currency: source.currency,
      siteCode: source.siteCode,
      attributes
    };
  }
  
  /**
   * Maps from service layer Session to integration layer SessionContext
   */
  mapToSource(service: Session): EmporixSessionContext {
    const context: Record<string, EmporixContextAttribute> = {};
    
    // Map attributes if they exist
    if (service.attributes) {
      Object.entries(service.attributes).forEach(([key, attribute]) => {
        context[key] = {
          key: attribute.key,
          value: attribute.value
        };
      });
    }
    
    return {
      sessionId: service.id,
      currency: service.currency,
      siteCode: service.siteCode,
      context
    };
  }
  
  /**
   * Maps a partial Session to a partial SessionContext
   */
  mapPartialToSource(partialSession: Partial<Session>): Partial<EmporixSessionContext> {
    const result: Partial<EmporixSessionContext> = {};
    
    if (partialSession.id !== undefined) {
      result.sessionId = partialSession.id;
    }
    
    if (partialSession.currency !== undefined) {
      result.currency = partialSession.currency;
    }
    
    if (partialSession.siteCode !== undefined) {
      result.siteCode = partialSession.siteCode;
    }
    
    if (partialSession.attributes) {
      const context: Record<string, EmporixContextAttribute> = {};
      
      Object.entries(partialSession.attributes).forEach(([key, attribute]) => {
        context[key] = {
          key: attribute.key,
          value: attribute.value
        };
      });
      
      result.context = context;
    }
    
    return result;
  }
  
  /**
   * Maps from service layer SessionAttribute to integration layer ContextAttribute
   */
  mapAttributeToSource(attribute: SessionAttribute): EmporixContextAttribute {
    return {
      key: attribute.key,
      value: attribute.value
    };
  }
}

export default EmporixSessionMapper;
