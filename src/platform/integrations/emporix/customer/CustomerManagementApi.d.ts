export interface Customer {
  id: string;
  customerNumber: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  company?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  preferredSite?: string;
  accounts?: AccountId[];
  addresses?: Address[];
  defaultAddress?: Address;
  businessModel?: 'B2B' | 'B2C';
  b2b?: B2BGet;
  mixins?: Record<string, any>;
  metadata?: DefaultDtoMetadata;
  lastLogin?: string;
}

export interface Address {
  id: string;
  contactName: string;
  companyName?: string;
  street?: string;
  streetNumber?: string;
  streetAppendix?: string;
  extraLine1?: string;
  extraLine2?: string;
  extraLine3?: string;
  extraLine4?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  state?: string;
  contactPhone?: string;
  isDefault?: boolean;
  tags?: string[];
  metadata?: DefaultDtoMetadata;
  mixins?: Record<string, any>;
}

export interface CustomerUpdateDto {
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  contactPhone?: string;
  company?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  preferredSite?: string;
  b2b?: B2BCreate;
  metadata?: DefaultDtoMetadata;
  mixins?: Record<string, any>;
  contactEmail?: string;
}

export interface AddressCreateDto {
  contactName: string;
  companyName?: string;
  street?: string;
  streetNumber?: string;
  streetAppendix?: string;
  extraLine1?: string;
  extraLine2?: string;
  extraLine3?: string;
  extraLine4?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  state?: string;
  contactPhone?: string;
  tags?: string[];
  metadata?: BasicMetadataDto;
  mixins?: Record<string, any>;
}

export interface AddressUpdateDto extends AddressCreateDto {
  isDefault?: boolean;
}

export interface ChangeEmailRequestDto {
  email: string;
  password: string;
  newEmail: string;
  syncContactEmail?: boolean;
}

export interface PasswordAuthentication {
  email: string;
  password: string;
}

export interface PasswordChangeDto {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequestDto {
  email: string;
  site?: string;
}

export interface PasswordUpdate {
  token: string;
  password: string;
}

export interface CustomerSignup {
  email: string;
  password: string;
  customerDetails: CustomerUpdateDto;
  customerAddress: Address;
}

export interface UpdateEmail {
  token: string;
}

export interface Auth0Request {
  email: string;
  name: string;
  picture?: string;
  provider: string;
}

export interface AccountId {
  id: string;
  providerId?: string;
}

export interface B2BCreate {
  companyRegistrationId?: string;
}

export interface B2BGet extends B2BCreate {
  legalEntities?: {
    id: string;
    name: string;
    contactAssignmentId: string;
  }[];
}

export interface BasicMetadataDto {
  mixins?: Record<string, any>;
}

export interface DefaultDtoMetadata extends BasicMetadataDto {
  version?: number;
}

export interface LegalEntity {
  id: string;
  name: string;
  type: 'COMPANY' | 'SUBSIDIARY';
  parentId?: string;
  accountLimit?: AccountLimit;
  legalInfo?: LegalInfo;
  customerGroups?: CustomerGroup[];
  entitiesAddresses?: ResourceId[];
  approvalGroup?: ResourceId[];
  metadata?: Metadata;
  mixins?: Mixins;
}

export interface LegalEntityCreate {
  id?: string;
  name: string;
  type?: 'COMPANY' | 'SUBSIDIARY';
  parentId?: string;
  accountLimit?: AccountLimit;
  legalInfo?: LegalInfo;
  customerGroups?: ResourceId[];
  entitiesAddresses?: ResourceId[];
  approvalGroup?: ResourceId[];
  metadata?: MetadataCreate;
  mixins?: Record<string, any>;
}

export interface LegalEntityUpdate {
  name: string;
  type: 'COMPANY' | 'SUBSIDIARY';
  parentId?: string;
  accountLimit?: AccountLimit;
  legalInfo?: LegalInfo;
  customerGroups?: ResourceId[];
  entitiesAddresses?: ResourceId[];
  approvalGroup?: ResourceId[];
  metadata?: MetadataUpdate;
  mixins?: Record<string, any>;
}

export interface ContactAssignment {
  id: string;
  legalEntity: LegalEntity;
  customer: Customer;
  type: 'PRIMARY' | 'BILLING' | 'LOGISTICS';
  primary: boolean;
  metadata?: Metadata;
  mixins?: Record<string, any>;
}

export interface ContactAssignmentCreate {
  id?: string;
  legalEntity: ResourceId;
  customer: ResourceId;
  type: 'PRIMARY' | 'BILLING' | 'LOGISTICS';
  primary?: boolean;
  metadata?: MetadataCreate;
  mixins?: Record<string, any>;
}

export interface ContactAssignmentUpdate {
  legalEntity: ResourceId;
  customer: ResourceId;
  type: 'PRIMARY' | 'BILLING' | 'LOGISTICS';
  primary?: boolean;
  metadata?: MetadataUpdate;
  mixins?: Record<string, any>;
}

export interface Location {
  id: string;
  name: string;
  type: 'HEADQUARTER' | 'WAREHOUSE' | 'OFFICE';
  contactDetails: ContactDetails;
  metadata?: Metadata;
  mixins?: Record<string, any>;
}

export interface LocationCreate {
  id?: string;
  name: string;
  type: 'HEADQUARTER' | 'WAREHOUSE' | 'OFFICE';
  contactDetails: ContactDetails;
  metadata?: MetadataCreate;
  mixins?: Record<string, any>;
}

export interface LocationUpdate {
  name: string;
  type: 'HEADQUARTER' | 'WAREHOUSE' | 'OFFICE';
  contactDetails: ContactDetails;
  metadata?: MetadataUpdate;
  mixins?: Record<string, any>;
}

export interface AccountLimit {
  currency: string;
  value: number;
}

export interface LegalInfo {
  legalName: string;
  registrationDate: string;
  taxRegistrationNumber: string;
  registrationAgency: string;
  countryOfRegistration: string;
  registrationId: string;
}

export interface CustomerGroup {
  id: string;
  name: Record<string, string>;
}

export interface ResourceId {
  id: string;
}

export interface Metadata {
  createdAt?: string;
  modifiedAt?: string;
  version?: number;
  mixins?: Record<string, any>;
}

export interface MetadataCreate {
  mixins?: Record<string, any>;
}

export interface MetadataUpdate {
  version?: number;
  mixins?: Record<string, any>;
}

export interface ContactDetails {
  emails?: string[];
  phones?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  countryCode?: string;
  tags?: string[];
}

export interface CustomerManagementApi {
  getLegalEntityById(id: string): Promise<LegalEntity | null>;
  createLegalEntity(legalEntity: LegalEntityCreate): Promise<LegalEntity>;
  updateLegalEntity(id: string, legalEntity: LegalEntityUpdate): Promise<LegalEntity>;
  getLegalEntities(): Promise<LegalEntity[]>;
  createContactAssignment(contactAssignment: ContactAssignmentCreate): Promise<ContactAssignment>;
  updateContactAssignment(id: string, contactAssignment: ContactAssignmentUpdate): Promise<ContactAssignment>;
  getContactAssignmentsByCustomerId(customerId: string): Promise<ContactAssignment[]>;
  getContactAssignmentById(id: string): Promise<ContactAssignment | null>;
  deleteContactAssignment(id: string): Promise<void>;
  createLocation(location: LocationCreate): Promise<Location>;
  updateLocation(id: string, location: LocationUpdate): Promise<Location>;
  getLocations(): Promise<Location[]>;
  getLocationById(id: string): Promise<Location | null>;
  deleteLocation(id: string): Promise<void>;
}
