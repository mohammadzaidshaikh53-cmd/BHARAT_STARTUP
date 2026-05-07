/**
 * Project One Solution: RFQ to Order Workflow Contracts
 */

export enum RFQToOrderState {
  DRAFT = 'DRAFT',
  RFQ_PUBLISHED = 'RFQ_PUBLISHED',
  QUOTES_IN_REVIEW = 'QUOTES_IN_REVIEW',
  NEGOTIATION = 'NEGOTIATION',
  QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
  ORDER_CREATED = 'ORDER_CREATED',
  CANCELLED = 'CANCELLED',
}

export enum RFQToOrderEvent {
  PUBLISH = 'PUBLISH',
  SUBMIT_QUOTE = 'SUBMIT_QUOTE',
  START_NEGOTIATION = 'START_NEGOTIATION',
  ACCEPT_QUOTE = 'ACCEPT_QUOTE',
  REJECT_QUOTE = 'REJECT_QUOTE',
  CREATE_ORDER = 'CREATE_ORDER',
  CANCEL = 'CANCEL',
}

export interface IRFQToOrderGuard {
  canPublish(rfqId: string): Promise<boolean>;
  canAcceptQuote(rfqId: string, quoteId: string): Promise<boolean>;
  canCreateOrder(quoteId: string): Promise<boolean>;
}

export type RFQToOrderTransitions = Record<RFQToOrderState, Partial<Record<RFQToOrderEvent, RFQToOrderState>>>;

export const RFQ_TO_ORDER_MAP: RFQToOrderTransitions = {
  [RFQToOrderState.DRAFT]: {
    [RFQToOrderEvent.PUBLISH]: RFQToOrderState.RFQ_PUBLISHED,
    [RFQToOrderEvent.CANCEL]: RFQToOrderState.CANCELLED,
  },
  [RFQToOrderState.RFQ_PUBLISHED]: {
    [RFQToOrderEvent.SUBMIT_QUOTE]: RFQToOrderState.QUOTES_IN_REVIEW,
    [RFQToOrderEvent.CANCEL]: RFQToOrderState.CANCELLED,
  },
  // Further transitions defined in implementation
} as any;
