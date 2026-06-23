import type { EmporixLocalizedString } from './common';

/**
 * Custom entity type names used by the Service Cockpit feature.
 */
export const SERVICE_TICKET_TYPE = 'SERVICE_COCKPIT_TICKET';
export const SERVICE_TICKET_STRUCTURE_TYPE = 'SERVICE_COCKPIT_TICKETS_STRUCTURE';
export const SERVICE_TICKET_STATUS_TYPE = 'SERVICE_COCKPIT_STATUSES';

/**
 * Mixin keys carried by the corresponding custom entities.
 */
export const SERVICE_TICKET_MIXIN = 'serviceCockpitTicket';
export const SERVICE_TICKET_STRUCTURE_MIXIN = 'serviceCockpitTicketStructure';
export const SERVICE_TICKET_STATUS_MIXIN = 'serviceCockpitStatuses';

/**
 * Raw message entry as stored on a `SERVICE_COCKPIT_TICKET` entity.
 * `internal: true` marks employee/AI-only notes that must never be shown to the
 * customer.
 */
export interface EmporixServiceTicketMessage {
  date?: string;
  sentAt?: string;
  message?: string;
  user?: string;
  internal?: boolean;
}

/**
 * Raw interaction timeline entry (employee facing - not exposed to customers).
 */
export interface EmporixServiceTicketInteraction {
  title?: string;
  description?: string;
  timestamp?: string;
}

/**
 * Raw `serviceCockpitTicket` mixin payload.
 */
export interface EmporixServiceTicketMixin {
  businessImpact?: string;
  companyId?: string;
  customerId?: string;
  summary?: string;
  type?: string;
  properties?: Record<string, string | number>;
  feedback?: { comment?: string; score?: number };
  sla?: { firstReactionTime?: string; resolutionTime?: string; status?: string; createdAt?: string };
  messages?: EmporixServiceTicketMessage[];
  interactions?: EmporixServiceTicketInteraction[];
  status?: string;
  priority?: string;
  assignee?: string;
}

/**
 * Raw field definition on a `serviceCockpitTicketStructure` mixin.
 */
export interface EmporixServiceTicketStructureField {
  id: string;
  name?: Array<{ language: string; value: string }>;
  required?: boolean;
  type?: string;
}

/**
 * Raw `serviceCockpitTicketStructure` mixin payload.
 */
export interface EmporixServiceTicketStructureMixin {
  fields?: EmporixServiceTicketStructureField[];
  availableSLAs?: string[];
}

/**
 * Raw `serviceCockpitStatuses` mixin payload.
 */
export interface EmporixServiceTicketStatusMixin {
  possibleTransitions?: string[];
  terminalStatus?: boolean;
  visibleForCustomer?: boolean;
  visibleForAgent?: boolean;
  reopenedStatus?: boolean;
}

/**
 * Localized name helper alias.
 */
export type EmporixLocalizedName = EmporixLocalizedString;
