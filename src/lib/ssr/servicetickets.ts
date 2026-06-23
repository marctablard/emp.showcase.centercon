'use server';

import { cache } from 'react';
import { getPublicDefaultLanguage } from '@/lib/common/public-default-env';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type {
  ServiceTicket,
  ServiceTicketStatusInfo,
  ServiceTicketType,
} from '@/platform/services/model/serviceticket';
import type { ServiceTicketService } from '@/platform/services/serviceticket/ServiceTicketService';
import ssr from '@/platform/ssr';

const getServiceTicketService = () => ssr.get<ServiceTicketService>('ServiceTicketService');
const getLogger = () => ssr.get<LoggerService>('LoggerService');

const resolveLocale = (locale?: string) => locale || getPublicDefaultLanguage();

/**
 * Get all service tickets for the current customer.
 * Cached per request to avoid duplicate fetches.
 */
export const getServiceTickets = cache(
  async (locale?: string, pageNumber?: number, pageSize?: number): Promise<ServiceTicket[] | undefined> => {
    try {
      const service = getServiceTicketService();
      const { items } = await service.listTickets(resolveLocale(locale), pageNumber, pageSize);
      return items;
    } catch (error) {
      getLogger().error(
        { error: error instanceof Error ? error.message : String(error) },
        'SSR getServiceTickets failed',
      );
      return undefined;
    }
  },
);

/**
 * Get a single service ticket for the current customer by id.
 */
export const getServiceTicketById = cache(
  async (ticketId: string, locale?: string): Promise<ServiceTicket | null | undefined> => {
    try {
      const service = getServiceTicketService();
      const ticket = await service.getTicket(ticketId, resolveLocale(locale));
      return ticket ?? null;
    } catch (error) {
      getLogger().error(
        { error: error instanceof Error ? error.message : String(error), ticketId },
        'SSR getServiceTicketById failed',
      );
      return undefined;
    }
  },
);

/**
 * Get the request types customers can use when creating a ticket.
 */
export const getServiceTicketTypes = cache(async (locale?: string): Promise<ServiceTicketType[]> => {
  try {
    const service = getServiceTicketService();
    return await service.getTicketTypes(resolveLocale(locale));
  } catch (error) {
    getLogger().error(
      { error: error instanceof Error ? error.message : String(error) },
      'SSR getServiceTicketTypes failed',
    );
    return [];
  }
});

/**
 * Get the customer-visible ticket statuses.
 */
export const getServiceTicketStatuses = cache(async (locale?: string): Promise<ServiceTicketStatusInfo[]> => {
  try {
    const service = getServiceTicketService();
    return await service.getStatuses(resolveLocale(locale));
  } catch (error) {
    getLogger().error(
      { error: error instanceof Error ? error.message : String(error) },
      'SSR getServiceTicketStatuses failed',
    );
    return [];
  }
});
