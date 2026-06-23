/**
 * Customer-facing service ticket domain models.
 *
 * These models intentionally expose only the data that is relevant to the
 * customer. Internal/employee/AI-agent data carried on the underlying Emporix
 * `SERVICE_COCKPIT_TICKET` custom entity (e.g. internal notes, agent
 * reasoning, assignee, SLA timers, interaction timeline) is filtered out in the
 * service layer and never reaches these types.
 */

/**
 * A single message in the ticket conversation that is visible to the customer.
 */
export interface ServiceTicketMessage {
  /** ISO timestamp of the message, when available. */
  date?: string;
  /** Sanitized HTML body of the message. */
  message: string;
  /** Whether the message was written by the customer or by support. */
  author: 'customer' | 'support';
}

/**
 * A structured field (from the ticket's request type) with its captured value.
 */
export interface ServiceTicketProperty {
  /** Field id as defined on the ticket structure (e.g. `ProductId`). */
  id: string;
  /** Localized, human readable label. Falls back to the field id. */
  label: string;
  /** Stringified field value as captured on the ticket. */
  value: string;
  /** Field type from the structure definition (e.g. `TEXT`, `NUMBER`). */
  type?: string;
  /** Resolved product id, when the field references a product. */
  productId?: string;
  /** Resolved product name, when the field references a product. */
  productName?: string;
}

/**
 * Customer feedback / satisfaction rating on a resolved ticket.
 */
export interface ServiceTicketFeedback {
  /** Rating score (e.g. 1-5). 0 means no rating yet. */
  score: number;
  /** Optional free text comment. */
  comment?: string;
}

/**
 * A customer-facing service ticket.
 */
export interface ServiceTicket {
  id: string;
  /** Ticket subject / title. */
  subject: string;
  /** Request type id (the ticket structure id, e.g. `product_ordering_issue`). */
  typeId?: string;
  /** Localized request type name. */
  typeName?: string;
  /** Customer provided summary / description of the issue. */
  summary?: string;
  /** Customer provided business impact. */
  businessImpact?: string;
  /** Priority / SLA assigned to the ticket. */
  priority?: string;
  /** Raw status id from the platform (e.g. `open`, `closed`). */
  statusId: string;
  /** Localized status name as defined on the status entity. */
  statusName: string;
  /** Whether the underlying status is meant to be shown to the customer. */
  statusVisibleToCustomer: boolean;
  /** Whether the status is terminal (the ticket is considered closed). */
  isTerminal: boolean;
  /** Whether the customer can reopen the ticket from its current status. */
  isReopenable: boolean;
  /** Status id the ticket should transition to when reopened, if reopenable. */
  reopenTargetStatusId?: string;
  /** Structured request-type fields with their captured values. */
  properties: ServiceTicketProperty[];
  /** Customer-visible conversation messages, oldest first. */
  messages: ServiceTicketMessage[];
  /** Customer feedback, when present. */
  feedback?: ServiceTicketFeedback;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * A field definition belonging to a request type (ticket structure).
 */
export interface ServiceTicketFieldDef {
  id: string;
  /** Localized label. */
  label: string;
  required: boolean;
  /** Field type (e.g. `TEXT`, `NUMBER`). */
  type: string;
}

/**
 * A request type the customer can pick when creating a ticket.
 * Backed by the `SERVICE_COCKPIT_TICKETS_STRUCTURE` custom entity.
 */
export interface ServiceTicketType {
  id: string;
  /** Localized name. */
  name: string;
  fields: ServiceTicketFieldDef[];
  /** SLAs/priorities available for this request type. */
  availableSLAs: string[];
}

/**
 * A status definition, backed by the `SERVICE_COCKPIT_STATUSES` custom entity.
 */
export interface ServiceTicketStatusInfo {
  id: string;
  name: string;
  visibleForCustomer: boolean;
  terminalStatus: boolean;
  reopenedStatus: boolean;
  possibleTransitions: string[];
}

/**
 * Input payload for creating a new service ticket.
 */
export interface CreateServiceTicketInput {
  /** Request type id (ticket structure id). */
  typeId: string;
  /** Subject / title of the ticket. */
  subject: string;
  /** Customer provided description of the issue. */
  summary: string;
  /** Customer provided business impact. */
  businessImpact?: string;
  /** Captured values for the request type's structured fields, keyed by field id. */
  properties?: Record<string, string | number>;
}
