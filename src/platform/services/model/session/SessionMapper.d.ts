import { Mapper } from '../Mapper';
import { Session, SessionAttribute } from './session';

/**
 * Specialized mapper interface for transforming between external session context data sources
 * and the internal Session domain model.
 *
 * @template SOURCE_TYPE - The external session context data format (typically from an API or data source)
 * @template SOURCE_ATTRIBUTE_TYPE - The external session attribute format
 * @extends {Mapper<SOURCE_TYPE, Session>} - Extends the generic Mapper interface with Session as the service type
 */
export interface SessionMapper<SOURCE_TYPE, SOURCE_ATTRIBUTE_TYPE = any> extends Mapper<SOURCE_TYPE, Session> {
  /**
   * Maps a partial Session to a partial SOURCE_TYPE
   *
   * @param partialSession - The partial session data in service format
   * @returns The transformed partial data in source format
   */
  mapPartialToSource(partialSession: Partial<Session>): Partial<SOURCE_TYPE>;

  /**
   * Maps from service layer SessionAttribute to source attribute type
   *
   * @param attribute - The session attribute in service format
   * @returns The attribute in source format
   */
  mapAttributeToSource(attribute: SessionAttribute): SOURCE_ATTRIBUTE_TYPE;
}
