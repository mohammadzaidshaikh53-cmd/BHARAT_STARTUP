/**
 * Project One Solution: Infrastructure Contracts
 */

export interface IQueueProvider {
  publish(queueName: string, payload: any, options?: any): Promise<void>;
  subscribe(queueName: string, handler: (payload: any) => Promise<void>): void;
}

export interface IStorageProvider {
  upload(path: string, file: Buffer, options?: any): Promise<string>;
  getDownloadUrl(path: string): Promise<string>;
  delete(path: string): Promise<void>;
}

export interface IPaymentProvider {
  createPaymentIntent(data: any): Promise<any>;
  verifyWebhook(signature: string, payload: any): Promise<boolean>;
}

/**
 * Enterprise Connectivity:
 * These contracts ensure that the domain logic doesn't depend 
 * on specific infrastructure implementations.
 */
