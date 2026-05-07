/**
 * Project One Solution: RBAC Foundations
 */

export enum SystemRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT = 'SUPPORT',
  MODERATOR = 'MODERATOR',
  AUDITOR = 'AUDITOR',
}

export enum OrganizationRole {
  ORG_OWNER = 'ORG_OWNER',
  PROCUREMENT_MANAGER = 'PROCUREMENT_MANAGER',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  SALES_MANAGER = 'SALES_MANAGER',
  SUPPLIER_REP = 'SUPPLIER_REP',
  BUYER_REP = 'BUYER_REP',
  EMPLOYEE = 'EMPLOYEE',
}

export enum Permission {
  // Organization Management
  ORG_VIEW = 'org:view',
  ORG_EDIT = 'org:edit',
  ORG_MANAGE_MEMBERS = 'org:manage_members',
  
  // Marketplace & RFQ
  MARKETPLACE_LIST = 'marketplace:list',
  MARKETPLACE_BUY = 'marketplace:buy',
  RFQ_CREATE = 'rfq:create',
  RFQ_VIEW = 'rfq:view',
  RFQ_RESPOND = 'rfq:respond',
  
  // Financials
  PAYMENTS_VIEW = 'payments:view',
  PAYMENTS_INITIATE = 'payments:initiate',
  ESCROW_RELEASE = 'escrow:release',
  
  // Verification
  VERIFICATION_SUBMIT = 'verification:submit',
  VERIFICATION_REVIEW = 'verification:review',
  
  // Audit
  AUDIT_VIEW = 'audit:view',
}

export interface UserPermissions {
  systemRole?: SystemRole;
  organizations: Array<{
    organizationId: string;
    role: OrganizationRole;
    permissions: Permission[];
  }>;
}

/**
 * Security Consideration:
 * These enums define the surface area of the platform's security.
 * Role-to-Permission mapping should be handled by a dedicated service.
 */
