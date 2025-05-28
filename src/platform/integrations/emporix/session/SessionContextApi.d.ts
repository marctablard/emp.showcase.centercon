import { EmporixSessionContext, EmporixContextAttribute } from '../model/session-context.d';

/**
 * Session Context API Interface for Emporix
 * Based on the Session Context Service OpenAPI specification
 */
export interface SessionContextApi {
  /**
   * Retrieves own session context
   * @returns Promise with the session context or undefined if not found
   */
  getOwnSessionContext(): Promise<EmporixSessionContext | undefined>;

  /**
   * Partially updates own session context
   * @param sessionContext The session context data to update
   * @returns Promise that resolves when the update is complete
   */
  updateOwnSessionContext(sessionContext: Partial<EmporixSessionContext>): Promise<void>;

  /**
   * Adds a new attribute to own session context
   * @param attribute The attribute to add
   * @returns Promise with the name of the created attribute
   */
  addOwnSessionContextAttribute(attribute: EmporixContextAttribute): Promise<string>;

  /**
   * Removes an attribute from own session context
   * @param attributeName The name of the attribute to remove
   * @returns Promise that resolves when the removal is complete
   */
  removeOwnSessionContextAttribute(attributeName: string): Promise<void>;

  /**
   * Retrieves a session context by ID
   * @param sessionId The session ID
   * @returns Promise with the session context or undefined if not found
   */
  getSessionContext(sessionId: string): Promise<EmporixSessionContext | undefined>;

  /**
   * Updates a session context by ID
   * @param sessionId The session ID
   * @param sessionContext The session context data to update
   * @param upsert Whether to create the session context if it doesn't exist
   * @returns Promise that resolves when the update is complete
   */
  updateSessionContext(sessionId: string, sessionContext: Partial<EmporixSessionContext>, upsert?: boolean): Promise<void>;

  /**
   * Adds a new attribute to a session context
   * @param sessionId The session ID
   * @param attribute The attribute to add
   * @returns Promise that resolves when the attribute is added
   */
  addSessionContextAttribute(sessionId: string, attribute: EmporixContextAttribute): Promise<void>;

  /**
   * Removes an attribute from a session context
   * @param sessionId The session ID
   * @param attributeName The name of the attribute to remove
   * @returns Promise that resolves when the removal is complete
   */
  removeSessionContextAttribute(sessionId: string, attributeName: string): Promise<void>;
}

