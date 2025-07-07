import { EmporixLocalizedString, EmporixMetadata } from '../model';

export interface EmporixCustomerManagementApi {
  getLegalEntityById(id: string): Promise<EmporixLegalEntity | null>;
  createLegalEntity(legalEntity: EmporixLegalEntity): Promise<EmporixLegalEntity>;
  updateLegalEntity(id: string, legalEntity: EmporixLegalEntity): Promise<EmporixLegalEntity>;
  getLegalEntities(): Promise<EmporixLegalEntity[]>;
  createContactAssignment(contactAssignment: EmporixContactAssignment): Promise<EmporixContactAssignment>;
  updateContactAssignment(id: string, contactAssignment: EmporixContactAssignment): Promise<EmporixContactAssignment>;
  getContactAssignmentsByCustomerId(customerId: string): Promise<EmporixContactAssignment[]>;
  getContactAssignmentById(id: string): Promise<EmporixContactAssignment | null>;
  deleteContactAssignment(id: string): Promise<void>;
  createLocation(location: EmporixLocation): Promise<EmporixLocation>;
  updateLocation(id: string, location: EmporixLocation): Promise<EmporixLocation>;
  getLocations(): Promise<EmporixLocation[]>;
  getLocationById(id: string): Promise<EmporixLocation | null>;
  deleteLocation(id: string): Promise<void>;
}
