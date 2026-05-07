/**
 * Project One Solution: Organization Domain Foundations
 */

import { BaseEntity, EntityId } from '../../shared/types';

export enum OrganizationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  VERIFIED = 'VERIFIED',
}

export enum OrganizationType {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  RETAILER = 'RETAILER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  GOVERNMENT = 'GOVERNMENT',
}

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  type: OrganizationType;
  status: OrganizationStatus;
  logoUrl?: string;
  website?: string;
  description?: string;
  taxId?: string; // GSTIN for India
  registrationNumber?: string;
}

export interface OrganizationMember {
  organizationId: EntityId;
  userId: EntityId;
  role: string; // References OrganizationRole
  departmentId?: EntityId;
  joinedAt: Date;
  status: 'ACTIVE' | 'INVITED' | 'REJECTED';
}

/**
 * Repository Contract
 */
export interface IOrganizationRepository {
  getById(id: EntityId): Promise<Organization | null>;
  getBySlug(slug: string): Promise<Organization | null>;
  create(data: Partial<Organization>): Promise<Organization>;
  update(id: EntityId, data: Partial<Organization>): Promise<Organization>;
  listMembers(orgId: EntityId): Promise<OrganizationMember[]>;
}
