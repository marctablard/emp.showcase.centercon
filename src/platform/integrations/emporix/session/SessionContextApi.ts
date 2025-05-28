import type { EmporixSessionContext, EmporixContextAttribute } from "../model/session-context";

export interface SessionContextApi {
  /**
   * Retrieves a specified session context.
   * @param sessionId Customer's session ID
   */
  getSessionContext(sessionId: string): Promise<EmporixSessionContext | undefined>;

  /**
   * Updates a specified session context.
   * @param sessionId Customer's session ID
   * @param sessionContext Session context to update
   * @param upsert If true and the session doesn't exist, it will be created
   */
  updateSessionContext(sessionId : string, sessionContext: Partial<EmporixSessionContext>, upsert?: boolean): Promise<void>;

  /**
   * Adds an attribute to a session context.
   * @param sessionId Customer's session ID
   * @param attribute Attribute to add
   */
  addSessionContextAttribute(sessionId: string, attribute: EmporixContextAttribute): Promise<void>;

  /**
   * Removes a particular attribute from a specified session context.
   * @param sessionId Customer's session ID
   * @param attributeName Name of the attribute to delete
   */
  removeSessionContextAttribute(sessionId: string, attributeName: string): Promise<void>;

  /**
   * Retrieves a session context associated with the current session.
   */
  getOwnSessionContext(): Promise<EmporixSessionContext | undefined>;

  /**
   * Partially updates a session context associated with the current session.
   * @param sessionContext Session context to update
   */
  updateOwnSessionContext(sessionContext: Partial<EmporixSessionContext>): Promise<void>;

  /**
   * Adds an attribute to the current session context.
   * @param attribute Attribute to add
   */
  addOwnSessionContextAttribute(attribute: EmporixContextAttribute): Promise<string>;

  /**
   * Removes a specified attribute from the current session context.
   * @param attributeName Name of the attribute to delete
   */
  removeOwnSessionContextAttribute(attributeName: string): Promise<void>;
}
