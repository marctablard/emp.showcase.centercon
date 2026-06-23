import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { EmporixPaginatedResponse, EmporixSearchParams } from '../../model/common';
import type { EmporixCustomEntity } from '../../model/schema';
import {
  SERVICE_TICKET_MIXIN,
  SERVICE_TICKET_STATUS_TYPE,
  SERVICE_TICKET_STRUCTURE_TYPE,
  SERVICE_TICKET_TYPE,
} from '../../model/serviceticket';
import type { EmporixSchemaApi } from '../../schema/EmporixSchemaApi';
import type { EmporixServiceTicketApi as IEmporixServiceTicketApi } from '../EmporixServiceTicketApi';

const MAX_LIST_PAGE_SIZE = 200;

/**
 * Default integration for the Service Cockpit custom entities.
 *
 * Implemented on top of the generic {@link EmporixSchemaApi} so that the
 * Emporix-specific custom-entity type names and the customer filter query live
 * in a single, well-defined integration boundary.
 */
@injectable('EmporixServiceTicketApi', 'Singleton')
export class EmporixServiceTicketApi implements IEmporixServiceTicketApi {
  constructor(@inject('EmporixSchemaApi') private schemaApi: EmporixSchemaApi) {}

  async getTicketsByCustomer(
    customerNumber: string,
    params: EmporixSearchParams<EmporixCustomEntity> = {},
  ): Promise<EmporixPaginatedResponse<EmporixCustomEntity>> {
    return this.schemaApi.getCustomEntities(SERVICE_TICKET_TYPE, {
      page: params.page ?? 1,
      size: params.size ?? 60,
      sort: params.sort,
      criteria: {
        // Restrict results to the tickets owned by this customer.
        [`mixins.${SERVICE_TICKET_MIXIN}.customerId`]: customerNumber,
        ...(params.criteria ?? {}),
      } as Partial<EmporixCustomEntity>,
    });
  }

  async getTicket(ticketId: string): Promise<EmporixCustomEntity | null> {
    return this.schemaApi.getCustomEntity(SERVICE_TICKET_TYPE, ticketId);
  }

  async createTicket(ticket: EmporixCustomEntity): Promise<string> {
    return this.schemaApi.createCustomEntity(SERVICE_TICKET_TYPE, ticket);
  }

  async updateTicket(ticketId: string, ticket: EmporixCustomEntity): Promise<void> {
    return this.schemaApi.updateCustomEntity(SERVICE_TICKET_TYPE, ticketId, ticket);
  }

  async getStructures(): Promise<EmporixCustomEntity[]> {
    const response = await this.schemaApi.getCustomEntities(SERVICE_TICKET_STRUCTURE_TYPE, {
      page: 1,
      size: MAX_LIST_PAGE_SIZE,
    });
    return response.items;
  }

  async getStatuses(): Promise<EmporixCustomEntity[]> {
    const response = await this.schemaApi.getCustomEntities(SERVICE_TICKET_STATUS_TYPE, {
      page: 1,
      size: MAX_LIST_PAGE_SIZE,
    });
    return response.items;
  }
}

export default EmporixServiceTicketApi;
