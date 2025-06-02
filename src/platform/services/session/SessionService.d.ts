import { Session, SessionAttribute } from '@/platform/services/model/session/session';

/**
 * Service for managing the current user's session context
 */
export interface SessionService {
  /**
   * Get the current session context
   */
  getCurrentSession(): Promise<Session | undefined>;

  /**
   * Update the current session context
   */
  updateCurrentSession(session: Partial<Session>): Promise<void>;

  /**
   * Add an attribute to the current session context
   */
  addAttributeToCurrentSession(attribute: SessionAttribute): Promise<string>;

  /**
   * Remove an attribute from the current session context
   */
  removeAttributeFromCurrentSession(attributeName: string): Promise<void>;
}
