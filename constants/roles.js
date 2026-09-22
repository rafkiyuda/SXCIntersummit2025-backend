const { StaffRole } = require('@prisma/client');

const AllAdminRoles = [
  StaffRole.ADMIN,
  StaffRole.BMC_ADMIN,
  StaffRole.BCL_ADMIN,
  StaffRole.IBCC_ADMIN,
  StaffRole.IBPC_ADMIN,
  StaffRole.CHAMBERS_ADMIN,
  StaffRole.COMPANY_VISIT_ADMIN,
  StaffRole.IC_ADMIN,
  StaffRole.PO
];

module.exports = {
  AllAdminRoles
};