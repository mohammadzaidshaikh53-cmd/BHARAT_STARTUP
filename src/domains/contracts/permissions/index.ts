import { Permission, OrganizationRole, SystemRole } from '../../../shared/permissions';

export enum ContractPermission {
  CONTRACT_CREATE = 'contract:create',
  CONTRACT_VIEW = 'contract:view',
  CONTRACT_EDIT = 'contract:edit',
  CONTRACT_SIGN = 'contract:sign',
  CONTRACT_AMEND = 'contract:amend',
  CONTRACT_TERMINATE = 'contract:terminate',
  CONTRACT_RENEW = 'contract:renew',
  CONTRACT_AUDIT = 'contract:audit',
}

export const ContractPermissionsMap: Record<OrganizationRole | SystemRole, ContractPermission[]> = {
  [SystemRole.SUPER_ADMIN]: Object.values(ContractPermission),
  [SystemRole.SUPPORT]: [ContractPermission.CONTRACT_VIEW, ContractPermission.CONTRACT_AUDIT],
  [SystemRole.MODERATOR]: [ContractPermission.CONTRACT_VIEW, ContractPermission.CONTRACT_AUDIT],
  [SystemRole.AUDITOR]: [ContractPermission.CONTRACT_VIEW, ContractPermission.CONTRACT_AUDIT],

  [OrganizationRole.ORG_OWNER]: [
    ContractPermission.CONTRACT_CREATE,
    ContractPermission.CONTRACT_VIEW,
    ContractPermission.CONTRACT_EDIT,
    ContractPermission.CONTRACT_SIGN,
    ContractPermission.CONTRACT_AMEND,
    ContractPermission.CONTRACT_TERMINATE,
    ContractPermission.CONTRACT_RENEW,
    ContractPermission.CONTRACT_AUDIT,
  ],
  [OrganizationRole.PROCUREMENT_MANAGER]: [
    ContractPermission.CONTRACT_CREATE,
    ContractPermission.CONTRACT_VIEW,
    ContractPermission.CONTRACT_EDIT,
    ContractPermission.CONTRACT_SIGN,
    ContractPermission.CONTRACT_AMEND,
  ],
  [OrganizationRole.FINANCE_MANAGER]: [
    ContractPermission.CONTRACT_VIEW,
    ContractPermission.CONTRACT_SIGN,
    ContractPermission.CONTRACT_AUDIT,
  ],
  [OrganizationRole.OPERATIONS_MANAGER]: [ContractPermission.CONTRACT_VIEW],
  [OrganizationRole.SALES_MANAGER]: [ContractPermission.CONTRACT_VIEW],
  [OrganizationRole.SUPPLIER_REP]: [ContractPermission.CONTRACT_VIEW, ContractPermission.CONTRACT_SIGN],
  [OrganizationRole.BUYER_REP]: [ContractPermission.CONTRACT_VIEW, ContractPermission.CONTRACT_SIGN],
  [OrganizationRole.EMPLOYEE]: [ContractPermission.CONTRACT_VIEW],
};
