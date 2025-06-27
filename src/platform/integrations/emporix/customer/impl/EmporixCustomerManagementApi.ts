import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import type { EmporixConfig } from '../../config';
import type {
  ContactAssignment,
  ContactAssignmentCreate,
  ContactAssignmentUpdate,
  CustomerManagementApi,
  LegalEntity,
  LegalEntityCreate,
  LegalEntityUpdate,
  Location,
  LocationCreate,
  LocationUpdate,
} from '../CustomerManagementApi.d';

@injectable('EmporixCustomerManagementApi', 'Singleton')
class EmporixCustomerManagementApi implements CustomerManagementApi {
  constructor(
    @inject('EmporixApiInvoker') private readonly apiClient: EmporixApiClient,
    @inject('EmporixConfig') private readonly config: EmporixConfig,
  ) {}

  async getContactAssignmentsByCustomerId(customerId: string): Promise<ContactAssignment[]> {
    const url = `/${this.config.tenant}/contact-assignments?customerId=${encodeURIComponent(customerId)}`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'GET' }, 'session');
    if (!response.ok)
      throw new Error(`Failed to retrieve contact assignments for customer ${customerId}: ${response.statusText}`);
    return response.json();
  }

  async createLegalEntity(data: LegalEntityCreate): Promise<LegalEntity> {
    const url = `/${this.config.tenant}/legal-entities`;
    const response = await this.apiClient.authenticatedFetch(
      url,
      { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } },
      'session',
    );
    if (!response.ok) throw new Error(`Failed to create legal entity: ${response.statusText}`);
    return response.json();
  }

  async getLegalEntities(): Promise<LegalEntity[]> {
    const url = `/${this.config.tenant}/legal-entities`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'GET' }, 'session');
    if (!response.ok) throw new Error(`Failed to retrieve legal entities: ${response.statusText}`);
    return response.json();
  }

  async getLegalEntityById(legalEntityId: string): Promise<LegalEntity> {
    const url = `customer-management/${this.config.tenant}/legal-entities/${legalEntityId}`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'GET' }, 'service');
    if (!response.ok) throw new Error(`Failed to retrieve legal entity: ${response.statusText}`);
    return response.json();
  }

  async updateLegalEntity(id: string, legalEntity: LegalEntityUpdate): Promise<LegalEntity> {
    const url = `/${this.config.tenant}/legal-entities/${id}`;
    const response = await this.apiClient.authenticatedFetch(
      url,
      { method: 'PUT', body: JSON.stringify(legalEntity), headers: { 'Content-Type': 'application/json' } },
      'session',
    );
    if (!response.ok) throw new Error(`Failed to update legal entity: ${response.statusText}`);
    return response.json();
  }

  async deleteLegalEntity(legalEntityId: string): Promise<void> {
    const url = `/${this.config.tenant}/legal-entities/${legalEntityId}`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'DELETE' }, 'session');
    if (!response.ok && response.status !== 204)
      throw new Error(`Failed to delete legal entity: ${response.statusText}`);
  }

  async createContactAssignment(data: ContactAssignmentCreate): Promise<ContactAssignment> {
    const url = `/${this.config.tenant}/contact-assignments`;
    const response = await this.apiClient.authenticatedFetch(
      url,
      { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } },
      'session',
    );
    if (!response.ok) throw new Error(`Failed to create contact assignment: ${response.statusText}`);
    return response.json();
  }

  async getContactAssignments(): Promise<ContactAssignment[]> {
    const url = `/${this.config.tenant}/contact-assignments`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'GET' }, 'session');
    if (!response.ok) throw new Error(`Failed to retrieve contact assignments: ${response.statusText}`);
    return response.json();
  }

  async getContactAssignmentById(contactAssignmentId: string): Promise<ContactAssignment> {
    const url = `/${this.config.tenant}/contact-assignments/${contactAssignmentId}`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'GET' }, 'session');
    if (!response.ok) throw new Error(`Failed to retrieve contact assignment: ${response.statusText}`);
    return response.json();
  }

  async updateContactAssignment(
    contactAssignmentId: string,
    data: ContactAssignmentUpdate,
  ): Promise<ContactAssignment> {
    const url = `/${this.config.tenant}/contact-assignments/${contactAssignmentId}`;
    const response = await this.apiClient.authenticatedFetch(
      url,
      { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } },
      'session',
    );
    if (!response.ok) throw new Error(`Failed to update contact assignment: ${response.statusText}`);
    return response.json();
  }

  async deleteContactAssignment(contactAssignmentId: string): Promise<void> {
    const url = `/${this.config.tenant}/contact-assignments/${contactAssignmentId}`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'DELETE' }, 'session');
    if (!response.ok && response.status !== 204)
      throw new Error(`Failed to delete contact assignment: ${response.statusText}`);
  }

  async createLocation(data: LocationCreate): Promise<Location> {
    const url = `/${this.config.tenant}/locations`;
    const response = await this.apiClient.authenticatedFetch(
      url,
      { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } },
      'session',
    );
    if (!response.ok) throw new Error(`Failed to create location: ${response.statusText}`);
    return response.json();
  }

  async getLocations(): Promise<Location[]> {
    const url = `/${this.config.tenant}/locations`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'GET' }, 'session');
    if (!response.ok) throw new Error(`Failed to retrieve locations: ${response.statusText}`);
    return response.json();
  }

  async getLocationById(locationId: string): Promise<Location> {
    const url = `/${this.config.tenant}/locations/${locationId}`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'GET' }, 'session');
    if (!response.ok) throw new Error(`Failed to retrieve location: ${response.statusText}`);
    return response.json();
  }

  async updateLocation(locationId: string, data: LocationUpdate): Promise<Location> {
    const url = `/${this.config.tenant}/locations/${locationId}`;
    const response = await this.apiClient.authenticatedFetch(
      url,
      { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } },
      'session',
    );
    if (!response.ok) throw new Error(`Failed to update location: ${response.statusText}`);
    return response.json();
  }

  async deleteLocation(locationId: string): Promise<void> {
    const url = `/${this.config.tenant}/locations/${locationId}`;
    const response = await this.apiClient.authenticatedFetch(url, { method: 'DELETE' }, 'session');
    if (!response.ok && response.status !== 204) throw new Error(`Failed to delete location: ${response.statusText}`);
  }
}

export default EmporixCustomerManagementApi;
