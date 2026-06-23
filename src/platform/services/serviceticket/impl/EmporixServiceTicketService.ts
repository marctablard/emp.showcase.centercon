import { inject } from 'inversify';
import { getPublicDefaultLanguage } from '@/lib/common/public-default-env';
import { injectable } from '@/platform/core/di/injectable';
import type { EmporixCustomerApi } from '@/platform/integrations/emporix/customer/EmporixCustomerApi';
import type { EmporixLocalizedString } from '@/platform/integrations/emporix/model/common';
import type { EmporixCustomEntity } from '@/platform/integrations/emporix/model/schema';
import {
  type EmporixServiceTicketMessage,
  type EmporixServiceTicketMixin,
  type EmporixServiceTicketStatusMixin,
  type EmporixServiceTicketStructureMixin,
  SERVICE_TICKET_MIXIN,
  SERVICE_TICKET_STATUS_MIXIN,
  SERVICE_TICKET_STRUCTURE_MIXIN,
} from '@/platform/integrations/emporix/model/serviceticket';
import type { EmporixServiceTicketApi } from '@/platform/integrations/emporix/serviceticket/EmporixServiceTicketApi';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type {
  CreateServiceTicketInput,
  ServiceTicket,
  ServiceTicketMessage,
  ServiceTicketProperty,
  ServiceTicketStatusInfo,
  ServiceTicketType,
} from '@/platform/services/model/serviceticket';
import type { ProductService } from '@/platform/services/product/ProductService';
import type { ServiceTicketListResult, ServiceTicketService } from '../ServiceTicketService';

interface CustomerContext {
  customerNumber: string;
  companyId?: string;
  email?: string;
}

/**
 * Default {@link ServiceTicketService} implementation backed by the Emporix
 * Service Cockpit custom entities. All data is scoped to the authenticated
 * customer and mapped to customer-safe domain models.
 */
@injectable('ServiceTicketService', 'Singleton')
export class EmporixServiceTicketService implements ServiceTicketService {
  constructor(
    @inject('EmporixServiceTicketApi') private ticketApi: EmporixServiceTicketApi,
    @inject('EmporixCustomerApi') private customerApi: EmporixCustomerApi,
    @inject('ProductService') private productService: ProductService,
    @inject('LoggerService') private logger: LoggerService,
  ) {}

  async listTickets(
    locale: string,
    pageNumber = 1,
    pageSize = 60,
    sort = 'metadata.modifiedAt:DESC',
  ): Promise<ServiceTicketListResult> {
    const customer = await this.getCustomerContext();
    if (!customer?.customerNumber) {
      return { items: [], totalCount: 0 };
    }

    const [statuses, structures, response] = await Promise.all([
      this.fetchStatusMap(locale),
      this.fetchStructureMap(locale),
      this.ticketApi.getTicketsByCustomer(customer.customerNumber, {
        page: pageNumber,
        size: pageSize,
        sort,
      }),
    ]);

    const items = response.items.map((entity) => this.mapTicket(entity, locale, statuses, structures, customer));

    return {
      items,
      totalCount: response.total >= 0 ? response.total : undefined,
    };
  }

  async getTicket(ticketId: string, locale: string): Promise<ServiceTicket | undefined> {
    const customer = await this.getCustomerContext();
    if (!customer?.customerNumber) {
      return undefined;
    }

    const entity = await this.ticketApi.getTicket(ticketId);
    if (!entity) {
      return undefined;
    }

    const mixin = this.getTicketMixin(entity);
    // Ownership check: never let a customer read another customer's ticket.
    if (mixin.customerId && mixin.customerId !== customer.customerNumber) {
      this.logger.warn({ ticketId }, 'Customer attempted to access a ticket they do not own');
      return undefined;
    }

    const [statuses, structures] = await Promise.all([this.fetchStatusMap(locale), this.fetchStructureMap(locale)]);

    const ticket = this.mapTicket(entity, locale, statuses, structures, customer);
    ticket.properties = await this.resolveProductProperties(ticket.properties, locale);
    return ticket;
  }

  async getTicketTypes(locale: string): Promise<ServiceTicketType[]> {
    const structures = await this.ticketApi.getStructures();
    return structures
      .map((entity) => this.mapStructure(entity, locale))
      .filter((type): type is ServiceTicketType => type !== null);
  }

  async getStatuses(locale: string): Promise<ServiceTicketStatusInfo[]> {
    const map = await this.fetchStatusMap(locale);
    return Object.values(map).filter((status) => status.visibleForCustomer);
  }

  async createTicket(input: CreateServiceTicketInput, locale: string): Promise<string> {
    const customer = await this.getCustomerContext();
    if (!customer?.customerNumber) {
      throw new Error('Authentication required');
    }

    const name: EmporixLocalizedString = { [locale]: input.subject };
    if (locale !== 'en') {
      name.en = input.subject;
    }

    const mixin: EmporixServiceTicketMixin = {
      customerId: customer.customerNumber,
      companyId: customer.companyId ?? '',
      type: input.typeId,
      summary: input.summary,
      businessImpact: input.businessImpact ?? '',
      status: 'open',
      priority: '',
      properties: input.properties ?? {},
      messages: [],
      interactions: [],
      feedback: { comment: '', score: 0 },
      sla: { firstReactionTime: '', resolutionTime: '', status: '' },
    };

    const entity: EmporixCustomEntity = {
      type: 'SERVICE_COCKPIT_TICKET',
      name,
      mixins: { [SERVICE_TICKET_MIXIN]: mixin },
    };

    return this.ticketApi.createTicket(entity);
  }

  async addCustomerMessage(ticketId: string, message: string): Promise<void> {
    const { entity, mixin, customer } = await this.loadOwnedTicket(ticketId);

    const newMessage: EmporixServiceTicketMessage = {
      date: new Date().toISOString(),
      message,
      user: customer.email ?? customer.customerNumber,
      internal: false,
    };

    mixin.messages = [...(mixin.messages ?? []), newMessage];
    await this.persistMixin(ticketId, entity, mixin);
  }

  async reopenTicket(ticketId: string): Promise<void> {
    const { entity, mixin } = await this.loadOwnedTicket(ticketId);
    const statuses = await this.fetchStatusMap(getPublicDefaultLanguage());
    const current = mixin.status ? statuses[mixin.status] : undefined;

    if (!current?.terminalStatus || current.possibleTransitions.length === 0) {
      throw new Error('Ticket cannot be reopened from its current status');
    }

    const target = current.possibleTransitions.find((id) => statuses[id]) ?? current.possibleTransitions[0];
    mixin.status = target;
    await this.persistMixin(ticketId, entity, mixin);
  }

  async submitFeedback(ticketId: string, score: number, comment?: string): Promise<void> {
    const { entity, mixin } = await this.loadOwnedTicket(ticketId);
    mixin.feedback = { score, comment: comment ?? '' };
    await this.persistMixin(ticketId, entity, mixin);
  }

  // --- internal helpers -----------------------------------------------------

  private async loadOwnedTicket(ticketId: string): Promise<{
    entity: EmporixCustomEntity;
    mixin: EmporixServiceTicketMixin;
    customer: CustomerContext;
  }> {
    const customer = await this.getCustomerContext();
    if (!customer?.customerNumber) {
      throw new Error('Authentication required');
    }
    const entity = await this.ticketApi.getTicket(ticketId);
    if (!entity) {
      throw new Error('Ticket not found');
    }
    const mixin = this.getTicketMixin(entity);
    if (mixin.customerId && mixin.customerId !== customer.customerNumber) {
      throw new Error('Ticket not found');
    }
    return { entity, mixin, customer };
  }

  private async persistMixin(
    ticketId: string,
    entity: EmporixCustomEntity,
    mixin: EmporixServiceTicketMixin,
  ): Promise<void> {
    const updated: EmporixCustomEntity = {
      ...entity,
      mixins: { ...(entity.mixins ?? {}), [SERVICE_TICKET_MIXIN]: mixin },
    };
    await this.ticketApi.updateTicket(ticketId, updated);
  }

  private async getCustomerContext(): Promise<CustomerContext | null> {
    try {
      const profile = await this.customerApi.getCustomerProfile();
      if (!profile?.customerNumber) {
        return null;
      }
      return {
        customerNumber: profile.customerNumber,
        companyId: profile.b2b?.legalEntities?.[0]?.id,
        email: profile.contactEmail,
      };
    } catch (error) {
      this.logger.warn(
        { err: error instanceof Error ? error.message : String(error) },
        'Failed to resolve customer context for service tickets',
      );
      return null;
    }
  }

  private getTicketMixin(entity: EmporixCustomEntity): EmporixServiceTicketMixin {
    return (entity.mixins?.[SERVICE_TICKET_MIXIN] as EmporixServiceTicketMixin | undefined) ?? {};
  }

  private mapTicket(
    entity: EmporixCustomEntity,
    locale: string,
    statuses: Record<string, ServiceTicketStatusInfo>,
    structures: Record<string, ServiceTicketType>,
    customer: CustomerContext,
  ): ServiceTicket {
    const mixin = this.getTicketMixin(entity);
    const statusId = mixin.status ?? 'open';
    const statusInfo = statuses[statusId];
    const structure = mixin.type ? structures[mixin.type] : undefined;

    const isTerminal = statusInfo?.terminalStatus ?? false;
    const transitions = statusInfo?.possibleTransitions ?? [];
    const isReopenable = isTerminal && transitions.length > 0;

    return {
      id: entity.id ?? '',
      subject: this.localized(entity.name, locale) || entity.id || '',
      typeId: mixin.type,
      typeName: structure?.name ?? mixin.type,
      summary: mixin.summary || undefined,
      businessImpact: mixin.businessImpact || undefined,
      priority: mixin.priority || undefined,
      statusId,
      statusName: statusInfo?.name ?? statusId,
      statusVisibleToCustomer: statusInfo?.visibleForCustomer ?? false,
      isTerminal,
      isReopenable,
      reopenTargetStatusId: isReopenable ? (transitions.find((id) => statuses[id]) ?? transitions[0]) : undefined,
      properties: this.mapProperties(mixin, structure),
      messages: this.mapMessages(mixin.messages, customer),
      feedback: mixin.feedback
        ? { score: mixin.feedback.score ?? 0, comment: mixin.feedback.comment || undefined }
        : undefined,
      createdAt: entity.metadata?.createdAt,
      updatedAt: entity.metadata?.modifiedAt,
    };
  }

  private mapProperties(
    mixin: EmporixServiceTicketMixin,
    structure: ServiceTicketType | undefined,
  ): ServiceTicketProperty[] {
    const properties = mixin.properties ?? {};
    return Object.entries(properties)
      .filter(([, value]) => value !== undefined && value !== null && `${value}`.trim() !== '')
      .map(([id, value]) => {
        const field = structure?.fields.find((f) => f.id === id);
        return {
          id,
          label: field?.label ?? id,
          value: `${value}`,
          type: field?.type,
        };
      });
  }

  private mapMessages(
    messages: EmporixServiceTicketMessage[] | undefined,
    customer: CustomerContext,
  ): ServiceTicketMessage[] {
    if (!Array.isArray(messages)) {
      return [];
    }
    return (
      messages
        // Hide every internal/employee/AI-only note.
        .filter((message) => message.internal !== true && (message.message ?? '').trim() !== '')
        .map((message) => ({
          date: message.date ?? message.sentAt,
          message: message.message ?? '',
          author: this.isCustomerAuthor(message.user, customer) ? 'customer' : 'support',
        }))
    );
  }

  private isCustomerAuthor(user: string | undefined, customer: CustomerContext): boolean {
    if (!user) {
      return false;
    }
    return user === customer.email || user === customer.customerNumber;
  }

  private async resolveProductProperties(
    properties: ServiceTicketProperty[],
    locale: string,
  ): Promise<ServiceTicketProperty[]> {
    return Promise.all(
      properties.map(async (property) => {
        const looksLikeProduct = /product/i.test(property.id) && property.value.trim() !== '';
        if (!looksLikeProduct) {
          return property;
        }
        try {
          const product = await this.productService.getProductById(property.value);
          if (!product) {
            return property;
          }
          return {
            ...property,
            productId: product.id,
            productName: this.localizedFlexible(product.name, locale),
          };
        } catch {
          return property;
        }
      }),
    );
  }

  private async fetchStatusMap(locale: string): Promise<Record<string, ServiceTicketStatusInfo>> {
    const statuses = await this.ticketApi.getStatuses();
    const map: Record<string, ServiceTicketStatusInfo> = {};
    for (const entity of statuses) {
      if (!entity.id) {
        continue;
      }
      const mixin = (entity.mixins?.[SERVICE_TICKET_STATUS_MIXIN] as EmporixServiceTicketStatusMixin | undefined) ?? {};
      map[entity.id] = {
        id: entity.id,
        name: this.localized(entity.name, locale) || entity.id,
        visibleForCustomer: mixin.visibleForCustomer ?? false,
        terminalStatus: mixin.terminalStatus ?? false,
        reopenedStatus: mixin.reopenedStatus ?? false,
        possibleTransitions: mixin.possibleTransitions ?? [],
      };
    }
    return map;
  }

  private async fetchStructureMap(locale: string): Promise<Record<string, ServiceTicketType>> {
    const structures = await this.ticketApi.getStructures();
    const map: Record<string, ServiceTicketType> = {};
    for (const entity of structures) {
      const type = this.mapStructure(entity, locale);
      if (type) {
        map[type.id] = type;
      }
    }
    return map;
  }

  private mapStructure(entity: EmporixCustomEntity, locale: string): ServiceTicketType | null {
    const mixin = entity.mixins?.[SERVICE_TICKET_STRUCTURE_MIXIN] as EmporixServiceTicketStructureMixin | undefined;
    if (!mixin || !entity.id) {
      return null;
    }
    const fields = mixin.fields ?? [];
    // Skip structures without fields - those are not real customer request types.
    if (fields.length === 0) {
      return null;
    }
    return {
      id: entity.id,
      name: this.localized(entity.name, locale) || entity.id,
      availableSLAs: mixin.availableSLAs ?? [],
      fields: fields.map((field) => ({
        id: field.id,
        label: this.localizedFieldName(field.name, locale) || field.id,
        required: field.required ?? false,
        type: field.type ?? 'TEXT',
      })),
    };
  }

  private localized(value: EmporixLocalizedString | undefined, locale: string): string {
    if (!value) {
      return '';
    }
    return value[locale] || value.en || Object.values(value)[0] || '';
  }

  private localizedFlexible(value: string | Record<string, string> | undefined, locale: string): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    return this.localized(value as EmporixLocalizedString, locale);
  }

  private localizedFieldName(name: Array<{ language: string; value: string }> | undefined, locale: string): string {
    if (!Array.isArray(name) || name.length === 0) {
      return '';
    }
    return (
      name.find((n) => n.language === locale)?.value ||
      name.find((n) => n.language === 'en')?.value ||
      name[0]?.value ||
      ''
    );
  }
}

export default EmporixServiceTicketService;
