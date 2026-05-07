/**
 * Project One Solution: Tenant Context
 * 
 * Future Purpose:
 * Provides a standardized way to access the current organization's context
 * throughout the request lifecycle.
 * 
 * Tenant Isolation:
 * Ensures that data fetching is always scoped to the active organization.
 */

import { EntityId } from '../types';
import { OrganizationRole, Permission } from '../permissions';

export interface TenantContext {
  organizationId: EntityId;
  role: OrganizationRole;
  permissions: Permission[];
  // Potential for branch/department scoping
  branchId?: EntityId;
  departmentId?: EntityId;
}

export interface UserContext {
  userId: EntityId;
  email: string;
  activeTenant?: TenantContext;
}

/**
 * Future Scaling:
 * This interface will be populated by middleware extracted from Supabase sessions
 * or custom JWT claims in a microservices environment.
 */
export interface ITenantProvider {
  getContext(): Promise<TenantContext | null>;
  setContext(context: TenantContext): void;
  clearContext(): void;
}
