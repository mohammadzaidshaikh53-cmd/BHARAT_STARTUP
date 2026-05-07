/**
 * Project One Solution: System Constants
 */

export const API_CONFIG = {
  VERSION: 'v1',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const VERIFICATION_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],
  PENDING_EXPIRY_DAYS: 30,
};

export const RFQ_CONSTRAINTS = {
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 200,
  MIN_ITEMS: 1,
  MAX_ITEMS: 50,
  MAX_EXPIRY_DAYS: 90,
};

export const AUDIT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export const CACHE_PREFIXES = {
  ORG: 'org:',
  USER: 'user:',
  PERMISSIONS: 'perm:',
  SESSION: 'sess:',
};

export const WORKFLOW_NAMES = {
  RFQ_TO_ORDER: 'rfq-to-order',
  ORG_VERIFICATION: 'organization-verification',
  SUPPLIER_ONBOARDING: 'supplier-onboarding',
};
