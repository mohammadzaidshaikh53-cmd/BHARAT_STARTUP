/**
 * Project One Solution: Base Domain Types
 * 
 * Future Purpose:
 * Provides a standardized set of properties for all domain entities.
 * Ensures consistent metadata across the entire ecosystem.
 */

export type EntityId = string;

export interface BaseEntity {
  id: EntityId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface AuditableEntity extends BaseEntity {
  createdBy: EntityId;
  updatedBy: EntityId;
  deletedBy?: EntityId | null;
}

/**
 * Organization Scoping
 * 
 * Tenant Isolation:
 * Every entity in the system must be scoped to an organization (tenant).
 */
export interface OrganizationScoped {
  organizationId: EntityId;
}

/**
 * Pagination Contracts
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
  };
}

/**
 * API Response Standard
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: Record<string, any>;
}
