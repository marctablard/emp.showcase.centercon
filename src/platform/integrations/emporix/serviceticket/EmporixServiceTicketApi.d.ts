import type { EmporixPaginatedResponse, EmporixSearchParams } from '../model/common';
import type { EmporixCustomEntity } from '../model/schema';

/**
 * Integration API for the Service Cockpit custom entities.
 *
 * This layer is responsible for talking to the Emporix Schema (custom entity)
 * API using the Service Cockpit specific entity types and query conventions.
 * It returns raw custom entities; mapping to customer-facing domain models and
 * filtering of internal data happens in the service layer.
 */
export interface EmporixServiceTicketApi {
  /**
   * List tickets belonging to a given customer (by customer number).
   * @param customerNumber Emporix customer number stored on the ticket.
   * @param params Optional pagination / sorting parameters.
   */
  getTicketsByCustomer(
    customerNumber: string,
    params?: EmporixSearchParams<EmporixCustomEntity>,
  ): Promise<EmporixPaginatedResponse<EmporixCustomEntity>>;

  /**
   * Get a single ticket by id.
   */
  getTicket(ticketId: string): Promise<EmporixCustomEntity | null>;

  /**
   * Create a new ticket custom entity.
   * @returns the created ticket id.
   */
  createTicket(ticket: EmporixCustomEntity): Promise<string>;

  /**
   * Replace a ticket custom entity (used for appending messages, reopening,
   * submitting feedback).
   */
  updateTicket(ticketId: string, ticket: EmporixCustomEntity): Promise<void>;

  /**
   * Get all request type structures.
   */
  getStructures(): Promise<EmporixCustomEntity[]>;

  /**
   * Get all ticket statuses.
   */
  getStatuses(): Promise<EmporixCustomEntity[]>;
}
