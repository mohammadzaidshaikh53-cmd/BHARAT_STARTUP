/**
 * Project One Solution: Security Abstractions
 */

import { EntityId } from '../../shared/types';

export interface IEncryptionService {
  encrypt(data: string): Promise<string>;
  decrypt(encryptedData: string): Promise<string>;
}

export interface ITokenService {
  generate(payload: any, options?: any): Promise<string>;
  verify<T>(token: string): Promise<T>;
  decode<T>(token: string): T;
}

export interface IHashingService {
  hash(data: string): Promise<string>;
  compare(data: string, hash: string): Promise<boolean>;
}

export interface IPIIMasker {
  maskEmail(email: string): string;
  maskPhone(phone: string): string;
  maskName(name: string): string;
}

/**
 * Audit-Safe Logging
 * Ensures sensitive data is never logged.
 */
export interface ISecureLogger {
  info(message: string, metadata?: any): void;
  warn(message: string, metadata?: any): void;
  error(message: string, error?: Error, metadata?: any): void;
}

export interface ISessionContext {
  sessionId: string;
  userId: EntityId;
  orgId?: EntityId;
  ipAddress: string;
}
