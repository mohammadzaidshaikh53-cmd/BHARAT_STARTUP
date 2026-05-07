/**
 * Project One Solution: Audit Domain Foundations
 */

import { EntityId, OrganizationScoped } from '../../shared/types';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  ACCESS = 'ACCESS',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  TRANSFER = 'TRANSFER',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AuditEvent extends OrganizationScoped {
  id: EntityId;
  timestamp: Date;
  actorId: EntityId;
  action: AuditAction;
  resourceType: string;
  resourceId: EntityId;
  severity: AuditSeverity;
  payload: {
    before?: any;
    after?: any;
    diff?: any;
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    traceId?: string;
  };
}

/**
 * Immutable Audit Contract
 */
export interface IAuditRepository {
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void>;
  query(filters: any): Promise<AuditEvent[]>;
  getById(id: EntityId): Promise<AuditEvent | null>;
}
