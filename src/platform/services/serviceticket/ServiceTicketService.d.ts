import {
  CreateServiceTicketInput,
  ServiceTicket,
  ServiceTicketStatusInfo,
  ServiceTicketType,
} from '../model/serviceticket';

/**
 * Paginated list of service tickets.
 */
export interface ServiceTicketListResult {
  items: ServiceTicket[];
  totalCount?: number;
}

/**
 * Service for the customer-facing Service Tickets feature.
 *
 * All methods scope data to the currently authenticated customer and map the
 * underlying Emporix custom entities to customer-safe domain models (internal
 * notes, AI-agent reasoning, assignee, SLA timers and the internal interaction
 * timeline are stripped out).
 */
export interface ServiceTicketService {
  /**
   * List the current customer's tickets.
   * @param locale Locale used to resolve localized labels.
   * @param pageNumber 1-based page number.
   * @param pageSize Page size.
   * @param sort Optional sort expression.
   */
  listTickets(locale: string, pageNumber?: number, pageSize?: number, sort?: string): Promise<ServiceTicketListResult>;

  /**
   * Get a single ticket by id, scoped to the current customer.
   * Returns undefined when the ticket does not exist or does not belong to the
   * current customer.
   */
  getTicket(ticketId: string, locale: string): Promise<ServiceTicket | undefined>;

  /**
   * Get the request types (ticket structures) available to customers.
   */
  getTicketTypes(locale: string): Promise<ServiceTicketType[]>;

  /**
   * Get the customer-visible ticket statuses.
   */
  getStatuses(locale: string): Promise<ServiceTicketStatusInfo[]>;

  /**
   * Create a new ticket for the current customer.
   * @returns the created ticket id.
   */
  createTicket(input: CreateServiceTicketInput, locale: string): Promise<string>;

  /**
   * Append a customer reply to a ticket conversation.
   */
  addCustomerMessage(ticketId: string, message: string): Promise<void>;

  /**
   * Reopen a terminal ticket (when its status allows it).
   */
  reopenTicket(ticketId: string): Promise<void>;

  /**
   * Submit customer satisfaction feedback for a ticket.
   */
  submitFeedback(ticketId: string, score: number, comment?: string): Promise<void>;
}
