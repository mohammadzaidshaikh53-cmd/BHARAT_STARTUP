export enum AnalyticsEventName {
  // Organization Activity
  ORG_CREATED = 'org.created',
  ORG_VERIFIED = 'org.verified',
  ORG_LOGIN = 'org.login',

  // RFQ Activity
  RFQ_CREATED = 'rfq.created',
  RFQ_QUOTE_SUBMITTED = 'rfq.quote_submitted',
  RFQ_COMPLETED = 'rfq.completed',

  // Marketplace Activity
  PRODUCT_VIEWED = 'marketplace.product_viewed',
  PRODUCT_SEARCHED = 'marketplace.product_searched',
  ORDER_PLACED = 'marketplace.order_placed',

  // System Activity
  ERROR_ENCOUNTERED = 'system.error',
  PERFORMANCE_LOGGED = 'system.performance',
}

export interface ITrackingContract {
  eventName: AnalyticsEventName;
  timestamp: Date;
  payload: Record<string, any>;
  version: string;
}
