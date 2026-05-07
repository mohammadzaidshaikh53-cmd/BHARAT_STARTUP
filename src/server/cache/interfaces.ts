/**
 * Project One Solution: Cache Abstractions
 */

import { EntityId } from '../../shared/types';

export interface ICacheOptions {
  ttl?: number;
  namespace?: string;
}

export interface ITenantAwareCache {
  get<T>(orgId: EntityId, key: string): Promise<T | null>;
  set<T>(orgId: EntityId, key: string, value: T, options?: ICacheOptions): Promise<void>;
  invalidate(orgId: EntityId, key: string): Promise<void>;
  invalidateOrg(orgId: EntityId): Promise<void>;
}

export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: ICacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clearNamespace(namespace: string): Promise<void>;
}
