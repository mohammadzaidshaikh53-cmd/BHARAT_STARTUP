/**
 * Project One Solution: Database Abstractions
 */

import { BaseEntity, EntityId, PaginationParams, PaginatedResponse } from '../../shared/types';

export interface IQueryOptions {
  filters?: Record<string, any>;
  pagination?: PaginationParams;
  include?: string[];
}

export interface IBaseRepository<T extends BaseEntity> {
  getById(id: EntityId): Promise<T | null>;
  list(options?: IQueryOptions): Promise<PaginatedResponse<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: EntityId, data: Partial<T>): Promise<T>;
  delete(id: EntityId): Promise<void>;
  count(filters?: Record<string, any>): Promise<number>;
}

/**
 * Unit of Work / Transaction Contract
 * Ensures atomic operations across multiple repositories.
 */
export interface IUnitOfWork {
  startTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  getRepository<T extends BaseEntity>(name: string): IBaseRepository<T>;
}
